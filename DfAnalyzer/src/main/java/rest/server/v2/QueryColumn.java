package rest.server.v2;

/**
 * Uma coluna do resultado, com o tipo que o catalogo declara para ela.
 *
 * @author joao
 */
public class QueryColumn {

    private final String name;
    private final String type;

    public QueryColumn(String name, String type) {
        this.name = name;
        this.type = type;
    }

    public String getName() { return name; }
    public String getType() { return type; }
}
