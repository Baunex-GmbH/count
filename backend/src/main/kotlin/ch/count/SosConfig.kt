package ch.count

import jakarta.enterprise.context.ApplicationScoped
import jakarta.enterprise.inject.Produces
import org.eclipse.microprofile.config.inject.ConfigProperty
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import java.net.URI

@ApplicationScoped
class SosConfig(
    @ConfigProperty(name = "count.sos.endpoint") val endpoint: String,
    @ConfigProperty(name = "count.sos.access-key") val accessKey: String,
    @ConfigProperty(name = "count.sos.secret-key") val secretKey: String,
) {
    @Produces
    @ApplicationScoped
    fun s3Client(): S3Client {
        return S3Client.builder()
            .endpointOverride(URI.create(endpoint))
            .region(Region.of("ch-gva-2"))
            .credentialsProvider(
                StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey, secretKey)
                )
            )
            .forcePathStyle(true)
            .build()
    }
}
