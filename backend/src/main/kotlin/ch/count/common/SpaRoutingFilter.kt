package ch.count.common

import io.vertx.ext.web.Router
import jakarta.enterprise.context.ApplicationScoped
import jakarta.enterprise.event.Observes

@ApplicationScoped
class SpaRoutingFilter {

    fun init(@Observes router: Router) {
        router.get("/*").handler { ctx ->
            val path = ctx.request().path()
            if (!path.startsWith("/api") && !path.contains(".")) {
                ctx.reroute("/")
            } else {
                ctx.next()
            }
        }
    }
}
