package rest.server.v2;

/**
 * One row of GET /api/v2/dataflows — everything the Studio's dataflow table shows, in a single round trip instead of one request per dataflow.
 *
 * @author joao
 */
public class DataflowSummary {

    public enum Status {
        /** No task was ever ingested for this dataflow. */
        EMPTY,
        /** At least one task is RUNNING. */
        RUNNING,
        /** Tasks exist and none is running, but some are still READY. */
        READY,
        /** Every ingested task reached FINISHED. */
        FINISHED
    }

    private final int id;
    private final String tag;
    private final int transformations;
    private final int datasets;
    private final int versions;
    /** Runs of this dataflow, across all versions. */
    private final int executions;
    private final int tasks;
    private final int tasksRunning;
    private final int tasksReady;
    /** ISO-ish `yyyy-MM-dd HH:mm:ss` as stored by performance.endtime; null if none. */
    private final String lastRun;
    /** Mean wall-clock seconds per performance record; null when unmeasurable. */
    private final Double avgDurationSeconds;
    private final Status status;
    /** Manual, generated, curated; null when not declared. */
    private final String origin;
    /** Free text naming what generated the mapping; null when not declared. */
    private final String generator;

    public DataflowSummary(int id, String tag, int transformations, int datasets, int versions,
            int executions, int tasks, int tasksRunning, int tasksReady, String lastRun,
            Double avgDurationSeconds, String origin, String generator) {
        this.id = id;
        this.tag = tag;
        this.transformations = transformations;
        this.datasets = datasets;
        this.versions = versions;
        this.executions = executions;
        this.tasks = tasks;
        this.tasksRunning = tasksRunning;
        this.tasksReady = tasksReady;
        this.lastRun = lastRun;
        this.avgDurationSeconds = avgDurationSeconds;
        this.status = deriveStatus(tasks, tasksRunning, tasksReady);
        this.origin = origin;
        this.generator = generator;
    }

    private static Status deriveStatus(int tasks, int running, int ready) {
        if (tasks == 0) {
            return Status.EMPTY;
        }
        if (running > 0) {
            return Status.RUNNING;
        }
        return ready > 0 ? Status.READY : Status.FINISHED;
    }

    public int getId() { return id; }
    public String getTag() { return tag; }
    public int getTransformations() { return transformations; }
    public int getDatasets() { return datasets; }
    public int getVersions() { return versions; }
    public int getExecutions() { return executions; }
    public int getTasks() { return tasks; }
    public int getTasksRunning() { return tasksRunning; }
    public int getTasksReady() { return tasksReady; }
    public String getLastRun() { return lastRun; }
    public Double getAvgDurationSeconds() { return avgDurationSeconds; }
    public Status getStatus() { return status; }
    public String getOrigin() { return origin; }
    public String getGenerator() { return generator; }
}
