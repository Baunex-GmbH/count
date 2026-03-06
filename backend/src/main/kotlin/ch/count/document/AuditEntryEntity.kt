package ch.count.document

import io.quarkus.hibernate.orm.panache.kotlin.PanacheRepositoryBase
import jakarta.enterprise.context.ApplicationScoped
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "audit_entry")
class AuditEntryEntity {
    @Id
    lateinit var id: String

    @Column(name = "document_id", nullable = false)
    lateinit var documentId: String

    @Column(nullable = false)
    lateinit var timestamp: LocalDateTime

    @Column(name = "user_id", nullable = false)
    lateinit var userId: String

    @Column(name = "user_name", nullable = false)
    lateinit var userName: String

    @Column(nullable = false)
    lateinit var action: String

    var details: String? = null
}

@ApplicationScoped
class AuditEntryRepository : PanacheRepositoryBase<AuditEntryEntity, String>
