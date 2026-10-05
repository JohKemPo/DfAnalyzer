package rest.server.v2;

import java.util.List;

/**
 * Payload of GET /api/v2/dataflows/{id}/ingestion-health, scoped to one dataflow.
 *
 * @author joao
 */
public class IngestionHealth {

    private final int tasks;
    private final int errorTasks;
    private final int runningTasks;
    private final List<IngestionAlert> alerts;

    public IngestionHealth(int tasks, int errorTasks, int runningTasks,
            List<IngestionAlert> alerts) {
        this.tasks = tasks;
        this.errorTasks = errorTasks;
        this.runningTasks = runningTasks;
        this.alerts = alerts;
    }

    public int getTasks() { return tasks; }
    public int getErrorTasks() { return errorTasks; }
    public int getRunningTasks() { return runningTasks; }
    public List<IngestionAlert> getAlerts() { return alerts; }
}
