package rest.server.v2;

/**
 * One row of GET /api/v2/dataflows/{id}/versions — the "versões" side of the versions×executions panel.
 *
 * @author joao
 */
public class VersionSummary {

    private final int version;
    private final int executions;
    private final int tasks;
    private final int errorTasks;
    /** `performance.endtime` of the last task of this version; null if none ran. */
    private final String lastRun;
    private final String origin;
    private final String generator;

    public VersionSummary(int version, int executions, int tasks, int errorTasks, String lastRun,
            String origin, String generator) {
        this.version = version;
        this.executions = executions;
        this.tasks = tasks;
        this.errorTasks = errorTasks;
        this.lastRun = lastRun;
        this.origin = origin;
        this.generator = generator;
    }

    public int getVersion() { return version; }
    public int getExecutions() { return executions; }
    public int getTasks() { return tasks; }
    public int getErrorTasks() { return errorTasks; }
    public String getLastRun() { return lastRun; }
    public String getOrigin() { return origin; }
    public String getGenerator() { return generator; }
}
