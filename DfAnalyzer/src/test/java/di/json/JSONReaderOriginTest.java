package di.json;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

import org.junit.Test;

/** Origem do mapeamento: vocabulario fechado, e ausencia nunca vira um valor presumido. */
public class JSONReaderOriginTest {

    @Test
    public void knownOriginsAreKeptCaseInsensitively() {
        assertEquals("manual", JSONReader.normalizeOrigin("manual"));
        assertEquals("generated", JSONReader.normalizeOrigin(" Generated "));
        assertEquals("curated", JSONReader.normalizeOrigin("CURATED"));
    }

    @Test
    public void absentOriginStaysAbsent() {
        // Nao declarado nao e "manual"
        assertNull(JSONReader.normalizeOrigin(null));
        assertNull(JSONReader.normalizeOrigin(""));
    }

    @Test
    public void unknownOriginIsNotStoredAsIs() {
        assertNull(JSONReader.normalizeOrigin("llm"));
        assertNull(JSONReader.normalizeOrigin(42));
    }
}
