package ch.count.document

import ch.count.auth.UserRepository
import ch.count.tenant.TenantService
import jakarta.enterprise.context.ApplicationScoped
import jakarta.transaction.Transactional
import jakarta.ws.rs.NotFoundException
import java.time.LocalDateTime
import java.util.UUID

@ApplicationScoped
class DocumentService(
    private val documentRepository: DocumentRepository,
    private val auditEntryRepository: AuditEntryRepository,
    private val userRepository: UserRepository,
    private val tenantService: TenantService,
) {
    fun listByTenant(userId: String, tenantId: String): List<DocumentDto> {
        tenantService.requireAccess(userId, tenantId)
        return documentRepository.findByTenantId(tenantId).map { toDto(it) }
    }

    fun findById(userId: String, documentId: String): DocumentDto {
        val doc = documentRepository.findById(documentId)
            ?: throw NotFoundException("Dokument nicht gefunden")
        tenantService.requireAccess(userId, doc.tenantId)
        return toDto(doc)
    }

    @Transactional
    fun createFromUpload(
        documentId: String,
        tenantId: String,
        userId: String,
        dateiname: String,
        dateityp: String,
    ): DocumentDto {
        tenantService.requireAccess(userId, tenantId)

        val user = userRepository.findById(userId)
            ?: throw NotFoundException("Benutzer nicht gefunden")

        val doc = DocumentEntity().apply {
            this.id = documentId
            this.tenantId = tenantId
            this.dateiname = dateiname
            this.dateityp = dateityp
            this.uploadDatum = LocalDateTime.now()
            this.uploadedBy = userId
            this.status = "In Pruefung"
        }
        documentRepository.persist(doc)

        val audit = AuditEntryEntity().apply {
            this.id = "audit-${UUID.randomUUID().toString().take(8)}"
            this.documentId = documentId
            this.timestamp = LocalDateTime.now()
            this.userId = userId
            this.userName = user.name
            this.action = "Hochgeladen"
            this.details = "Dokument hochgeladen"
        }
        auditEntryRepository.persist(audit)

        return findById(userId, documentId)
    }

    @Transactional
    fun updateStatus(userId: String, documentId: String, newStatus: String): DocumentDto {
        val doc = documentRepository.findById(documentId)
            ?: throw NotFoundException("Dokument nicht gefunden")
        tenantService.requireAccess(userId, doc.tenantId)

        val user = userRepository.findById(userId)
            ?: throw NotFoundException("Benutzer nicht gefunden")

        doc.status = newStatus
        documentRepository.persist(doc)

        val audit = AuditEntryEntity().apply {
            this.id = "audit-${UUID.randomUUID().toString().take(8)}"
            this.documentId = documentId
            this.timestamp = LocalDateTime.now()
            this.userId = userId
            this.userName = user.name
            this.action = "Status → $newStatus"
            this.details = "Status geändert auf $newStatus"
        }
        auditEntryRepository.persist(audit)

        return findById(userId, documentId)
    }

    @Transactional
    fun updateOcr(userId: String, documentId: String, ocrResult: OcrResult?): DocumentDto {
        val doc = documentRepository.findById(documentId)
            ?: throw NotFoundException("Dokument nicht gefunden")
        tenantService.requireAccess(userId, doc.tenantId)

        doc.ocrResult = ocrResult
        documentRepository.persist(doc)

        return findById(userId, documentId)
    }

    @Transactional
    fun archive(userId: String, documentId: String): DocumentDto {
        val doc = documentRepository.findById(documentId)
            ?: throw NotFoundException("Dokument nicht gefunden")
        tenantService.requireAccess(userId, doc.tenantId)

        val user = userRepository.findById(userId)
            ?: throw NotFoundException("Benutzer nicht gefunden")

        doc.status = "Archiviert"
        documentRepository.persist(doc)

        val audit = AuditEntryEntity().apply {
            this.id = "audit-${UUID.randomUUID().toString().take(8)}"
            this.documentId = documentId
            this.timestamp = LocalDateTime.now()
            this.userId = userId
            this.userName = user.name
            this.action = "Archiviert"
            this.details = "Beleg wurde archiviert"
        }
        auditEntryRepository.persist(audit)

        return findById(userId, documentId)
    }

    @Transactional
    fun restore(userId: String, documentId: String): DocumentDto {
        val doc = documentRepository.findById(documentId)
            ?: throw NotFoundException("Dokument nicht gefunden")
        tenantService.requireAccess(userId, doc.tenantId)

        val user = userRepository.findById(userId)
            ?: throw NotFoundException("Benutzer nicht gefunden")

        doc.status = if (doc.ocrResult != null) "Verbucht" else "In Pruefung"
        documentRepository.persist(doc)

        val audit = AuditEntryEntity().apply {
            this.id = "audit-${UUID.randomUUID().toString().take(8)}"
            this.documentId = documentId
            this.timestamp = LocalDateTime.now()
            this.userId = userId
            this.userName = user.name
            this.action = "Wiederhergestellt"
            this.details = "Beleg wurde wiederhergestellt"
        }
        auditEntryRepository.persist(audit)

        return findById(userId, documentId)
    }

    @Transactional
    fun delete(userId: String, documentId: String, storageService: DocumentStorageService) {
        val doc = documentRepository.findById(documentId)
            ?: throw NotFoundException("Dokument nicht gefunden")
        tenantService.requireAccess(userId, doc.tenantId)

        // Delete S3 file
        try {
            storageService.delete(doc.tenantId, doc.id, doc.dateiname)
        } catch (_: Exception) {
            // File may not exist in S3 (seed data)
        }

        // Delete audit entries first (FK)
        auditEntryRepository.delete("documentId", documentId)
        documentRepository.deleteById(documentId)
    }

    private fun toDto(entity: DocumentEntity) = DocumentDto(
        id = entity.id,
        tenantId = entity.tenantId,
        dateiname = entity.dateiname,
        dateityp = entity.dateityp,
        uploadDatum = entity.uploadDatum,
        uploadedBy = entity.uploadedBy,
        status = entity.status,
        ocrResult = entity.ocrResult,
        vorschauUrl = "/api/documents/${entity.tenantId}/${entity.id}/${entity.dateiname}",
        auditLog = entity.auditLog.map { toAuditDto(it) },
    )

    private fun toAuditDto(entity: AuditEntryEntity) = AuditEntryDto(
        id = entity.id,
        documentId = entity.documentId,
        timestamp = entity.timestamp,
        userId = entity.userId,
        userName = entity.userName,
        action = entity.action,
        details = entity.details,
    )
}
