package qp.query;

/**
 * Raised when a user-supplied query specification does not survive the deterministic allowlist validation performed by QueryGuard.
 *
 * @author joao
 */
public class QueryValidationException extends RuntimeException {

    public QueryValidationException(String message) {
        super(message);
    }
}
