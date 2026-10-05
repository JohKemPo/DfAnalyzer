package rest.server.v2;

import java.util.List;

/**
 * Payload of GET /api/v2/dataflows/{id}/executions/{execId}/timeline — one bar per transformation, plus the tasks that didn't finish clean.
 *
 * @author joao
 */
public class ExecutionTimeline {

    private final ExecutionSummary execution;
    private final List<TimelineRow> rows;
    private final List<TaskAnomaly> anomalies;

    public ExecutionTimeline(ExecutionSummary execution, List<TimelineRow> rows,
            List<TaskAnomaly> anomalies) {
        this.execution = execution;
        this.rows = rows;
        this.anomalies = anomalies;
    }

    public ExecutionSummary getExecution() { return execution; }
    public List<TimelineRow> getRows() { return rows; }
    public List<TaskAnomaly> getAnomalies() { return anomalies; }
}
