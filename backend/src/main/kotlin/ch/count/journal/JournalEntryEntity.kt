package ch.count.journal

import io.quarkus.hibernate.orm.panache.kotlin.PanacheRepositoryBase
import jakarta.enterprise.context.ApplicationScoped
import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "journal_entry")
class JournalEntryEntity {
    @Id
    lateinit var id: String

    @Column(name = "tenant_id", nullable = false)
    lateinit var tenantId: String

    @Column(name = "document_id")
    var documentId: String? = null

    @Column(name = "buchungs_datum", nullable = false)
    lateinit var buchungsDatum: LocalDate

    @Column(name = "erfassungs_datum", nullable = false)
    lateinit var erfassungsDatum: LocalDateTime

    @Column(nullable = false)
    lateinit var belegnummer: String

    var beschreibung: String? = null

    @Column(nullable = false)
    var status: String = "OCR-Vorschlag"

    @OneToMany(mappedBy = "journalEntryId", fetch = FetchType.EAGER)
    var lines: MutableList<JournalLineEntity> = mutableListOf()
}

@ApplicationScoped
class JournalEntryRepository : PanacheRepositoryBase<JournalEntryEntity, String> {
    fun findByTenantId(tenantId: String): List<JournalEntryEntity> =
        list("tenantId", tenantId)
}
