package rest.server;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Serves the DfA Studio single-page application.
 *
 * @author joao
 */
@Controller
public class StudioController {

    @RequestMapping({
        "/studio",
        "/studio/",
        "/studio/{path:[^\\.]*}",
        "/studio/**/{path:[^\\.]*}"
    })
    public String studio() {
        return "forward:/studio/index.html";
    }
}
