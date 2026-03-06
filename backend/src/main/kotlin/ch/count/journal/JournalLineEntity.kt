package ch.count.journal

import io.quarkus.hibernate.orm.panache.kotlin.PanacheRepositoryBase
import jakarta.enterprise.context.ApplicationScoped
import jakarta.persistence.*
import java.math.BigDecimal

@Entity
@Table(name = "journal_line")
class JournalLineEntity {
    @Id
    lateinit var id: String

    @Column(name = "journal_entry_id", nullable = false)
    lateinit var journalEntryId: String

    @Column(name = "konto_nummer", nullable = false)
    lateinit var kontoNummer: String

    @Column(name = "konto_bezeichnung", nullable = false)
    lateinit var kontoBezeichnung: String

    @Column(nullable = false)
    var soll: BigDecimal = BigDecimal.ZERO

    @Column(nullable = false)
    var haben: BigDecimal = BigDecimal.ZERO

    var text: String? = null
}

@ApplicationScoped
class JournalLineRepository : PanacheRepositoryBase<JournalLineEntity, String>
