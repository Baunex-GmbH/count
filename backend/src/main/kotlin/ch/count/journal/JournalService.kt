package ch.count.journal

import ch.count.tenant.TenantService
import jakarta.enterprise.context.ApplicationScoped
import jakarta.transaction.Transactional
import java.time.LocalDateTime
import java.util.UUID

@ApplicationScoped
class JournalService(
    private val journalEntryRepository: JournalEntryRepository,
    private val journalLineRepository: JournalLineRepository,
    private val tenantService: TenantService,
) {
    fun listByTenant(userId: String, tenantId: String): List<JournalEntryDto> {
        tenantService.requireAccess(userId, tenantId)
        return journalEntryRepository.findByTenantId(tenantId).map { toDto(it) }
    }

    @Transactional
    fun create(userId: String, request: CreateJournalEntryRequest): JournalEntryDto {
        tenantService.requireAccess(userId, request.tenantId)

        val entryId = "journal-${UUID.randomUUID().toString().take(8)}"
        val entry = JournalEntryEntity().apply {
            this.id = entryId
            this.tenantId = request.tenantId
            this.documentId = request.documentId
            this.buchungsDatum = request.buchungsDatum
            this.erfassungsDatum = LocalDateTime.now()
            this.belegnummer = request.belegnummer
            this.beschreibung = request.beschreibung
            this.status = request.status
        }
        journalEntryRepository.persist(entry)

        val lines = request.lines.map { lineReq ->
            JournalLineEntity().apply {
                this.id = "jl-${UUID.randomUUID().toString().take(8)}"
                this.journalEntryId = entryId
                this.kontoNummer = lineReq.kontoNummer
                this.kontoBezeichnung = lineReq.kontoBezeichnung
                this.soll = lineReq.soll
                this.haben = lineReq.haben
                this.text = lineReq.text
            }
        }
        lines.forEach { journalLineRepository.persist(it) }

        entry.lines = lines.toMutableList()
        return toDto(entry)
    }

    private fun toDto(entity: JournalEntryEntity) = JournalEntryDto(
        id = entity.id,
        tenantId = entity.tenantId,
        documentId = entity.documentId,
        buchungsDatum = entity.buchungsDatum,
        erfassungsDatum = entity.erfassungsDatum,
        belegnummer = entity.belegnummer,
        beschreibung = entity.beschreibung,
        status = entity.status,
        lines = entity.lines.map { toLineDto(it) },
    )

    private fun toLineDto(entity: JournalLineEntity) = JournalLineDto(
        id = entity.id,
        kontoNummer = entity.kontoNummer,
        kontoBezeichnung = entity.kontoBezeichnung,
        soll = entity.soll,
        haben = entity.haben,
        text = entity.text,
    )
}
