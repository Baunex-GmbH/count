package ch.count.document

import io.quarkus.hibernate.orm.panache.kotlin.PanacheRepositoryBase
import jakarta.enterprise.context.ApplicationScoped
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.LocalDateTime

@Entity
@Table(name = "document")
class DocumentEntity {
    @Id
    lateinit var id: String

    @Column(name = "tenant_id", nullable = false)
    lateinit var tenantId: String

    @Column(nullable = false)
    lateinit var dateiname: String

    @Column(nullable = false)
    lateinit var dateityp: String

    @Column(name = "upload_datum", nullable = false)
    lateinit var uploadDatum: LocalDateTime

    @Column(name = "uploaded_by", nullable = false)
    lateinit var uploadedBy: String

    @Column(nullable = false)
    var status: String = "In Pruefung"

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "ocr_result", columnDefinition = "jsonb")
    var ocrResult: OcrResult? = null

    @Column(name = "vorschau_url")
    var vorschauUrl: String? = null

    @OneToMany(mappedBy = "documentId", fetch = FetchType.EAGER)
    @OrderBy("timestamp ASC")
    var auditLog: MutableList<AuditEntryEntity> = mutableListOf()
}

@ApplicationScoped
class DocumentRepository : PanacheRepositoryBase<DocumentEntity, String> {
    fun findByTenantId(tenantId: String): List<DocumentEntity> =
        list("tenantId", tenantId)
}
