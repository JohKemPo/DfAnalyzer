package rest.config;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.sql2o.Connection;
import org.sql2o.Sql2o;
import org.sql2o.data.Row;
import org.sql2o.data.Table;

import rest.server.v2.DataflowSummary;

/**
 * Read model behind the v2 API.
 *
 * @author joao
 */
@Repository
public class CatalogDao {

    /** One statement for the whole dataflow table. */
    private static final String DATAFLOW_SUMMARY_SQL =
            "SELECT df.id AS id, df.tag AS tag,"
            + " (SELECT COUNT(*) FROM data_transformation dt WHERE dt.df_id = df.id) AS transformations,"
            + " (SELECT COUNT(*) FROM data_set ds WHERE ds.df_id = df.id) AS datasets,"
            + " (SELECT COUNT(*) FROM dataflow_version v WHERE v.df_id = df.id) AS versions,"
            + " (SELECT COUNT(*) FROM dataflow_execution e, dataflow_version v"
            + "    WHERE v.df_id = df.id AND e.df_version = v.version) AS executions,"
            + " (SELECT COUNT(*) FROM task t, dataflow_version v"
            + "    WHERE v.df_id = df.id AND t.df_version = v.version) AS tasks,"
            + " (SELECT COUNT(*) FROM task t, dataflow_version v"
            + "    WHERE v.df_id = df.id AND t.df_version = v.version AND t.status = 'RUNNING') AS running,"
            + " (SELECT COUNT(*) FROM task t, dataflow_version v"
            + "    WHERE v.df_id = df.id AND t.df_version = v.version AND t.status = 'READY') AS ready,"
            + " (SELECT MAX(p.endtime) FROM performance p, task t, dataflow_version v"
            + "    WHERE v.df_id = df.id AND t.df_version = v.version AND p.task_id = t.id) AS lastrun,"
            + " (SELECT AVG(CAST(p.endtime AS TIMESTAMP) - CAST(p.starttime AS TIMESTAMP))"
            + "    FROM performance p, task t, dataflow_version v"
            + "    WHERE v.df_id = df.id AND t.df_version = v.version AND p.task_id = t.id) AS avgseconds,"
            + " (SELECT v.origin FROM dataflow_version v WHERE v.version ="
            + "    (SELECT MAX(v2.version) FROM dataflow_version v2 WHERE v2.df_id = df.id)) AS origin,"
            + " (SELECT v.generator FROM dataflow_version v WHERE v.version ="
            + "    (SELECT MAX(v2.version) FROM dataflow_version v2 WHERE v2.df_id = df.id)) AS generator"
            + " FROM dataflow df"
            + " ORDER BY df.id DESC"
            + " LIMIT :limit OFFSET :offset;";

    @Autowired
    private Sql2o sql2o;

    public long countDataflows() {
        return count("SELECT COUNT(*) AS total FROM dataflow;");
    }

    public List<DataflowSummary> getDataflowSummaries(int limit, int offset) {
        try (Connection con = sql2o.open()) {
            Table table = con.createQuery(DATAFLOW_SUMMARY_SQL)
                    .addParameter("limit", limit)
                    .addParameter("offset", offset)
                    .executeAndFetchTable();

            List<DataflowSummary> summaries = new ArrayList<>(table.rows().size());
            for (Row row : table.rows()) {
                summaries.add(new DataflowSummary(
                        row.getInteger("id"),
                        row.getString("tag"),
                        intOf(row, "transformations"),
                        intOf(row, "datasets"),
                        intOf(row, "versions"),
                        intOf(row, "executions"),
                        intOf(row, "tasks"),
                        intOf(row, "running"),
                        intOf(row, "ready"),
                        row.getString("lastrun"),
                        secondsOf(row, "avgseconds"),
                        row.getString("origin"),
                        row.getString("generator")));
            }
            return summaries;
        }
    }

    public long countVersions() {
        return count("SELECT COUNT(*) AS total FROM dataflow_version;");
    }

    public long countExecutions() {
        return count("SELECT COUNT(*) AS total FROM dataflow_execution;");
    }

    public long countTasks() {
        return count("SELECT COUNT(*) AS total FROM task;");
    }

    public long countTransformations() {
        return count("SELECT COUNT(*) AS total FROM data_transformation;");
    }

    /** Private on purpose, and every caller above passes a compile-time constant. */
    private long count(String sql) {
        try (Connection con = sql2o.open()) {
            Table result = con.createQuery(sql).executeAndFetchTable();
            return result.rows().isEmpty() ? 0L : result.rows().get(0).getLong("total");
        }
    }

    private static int intOf(Row row, String column) {
        Object value = row.getObject(column);
        return value instanceof Number ? ((Number) value).intValue() : 0;
    }

    /** MonetDB returns the timestamp difference as a decimal number of seconds. */
    private static Double secondsOf(Row row, String column) {
        Object value = row.getObject(column);
        if (value == null) {
            return null;
        }
        if (value instanceof BigDecimal) {
            return ((BigDecimal) value).doubleValue();
        }
        return value instanceof Number ? ((Number) value).doubleValue() : null;
    }
}
