package rest.server.v2;

/**
 * One bar of the Gantt in GET /api/v2/dataflows/{id}/executions/{execId}/timeline — every task of one transformation, in one execution, folded into a single span.
 *
 * @author joao
 */
public class TimelineRow {

    private final String transformationTag;
    private final int taskCount;
    private final int errorTaskCount;
    private final double startOffsetSeconds;
    private final double durationSeconds;

    public TimelineRow(String transformationTag, int taskCount, int errorTaskCount,
            double startOffsetSeconds, double durationSeconds) {
        this.transformationTag = transformationTag;
        this.taskCount = taskCount;
        this.errorTaskCount = errorTaskCount;
        this.startOffsetSeconds = startOffsetSeconds;
        this.durationSeconds = durationSeconds;
    }

    public String getTransformationTag() { return transformationTag; }
    public int getTaskCount() { return taskCount; }
    public int getErrorTaskCount() { return errorTaskCount; }
    public double getStartOffsetSeconds() { return startOffsetSeconds; }
    public double getDurationSeconds() { return durationSeconds; }
}
