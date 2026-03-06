package ch.count.document

import jakarta.enterprise.context.ApplicationScoped
import org.eclipse.microprofile.config.inject.ConfigProperty
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import java.io.InputStream

data class StoredFile(val stream: InputStream, val contentType: String)

@ApplicationScoped
class DocumentStorageService(
    private val s3: S3Client,
    @ConfigProperty(name = "count.sos.bucket") val bucket: String,
) {
    fun upload(
        tenantId: String,
        documentId: String,
        filename: String,
        contentType: String,
        data: InputStream,
        size: Long,
    ) {
        val key = "$tenantId/$documentId/$filename"
        s3.putObject(
            PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(contentType)
                .build(),
            RequestBody.fromInputStream(data, size),
        )
    }

    fun delete(tenantId: String, documentId: String, filename: String) {
        val key = "$tenantId/$documentId/$filename"
        s3.deleteObject(
            DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build()
        )
    }

    fun download(tenantId: String, documentId: String, filename: String): StoredFile {
        val key = "$tenantId/$documentId/$filename"
        val response = s3.getObject(
            GetObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build()
        )
        return StoredFile(
            stream = response,
            contentType = response.response().contentType() ?: "application/octet-stream",
        )
    }
}
