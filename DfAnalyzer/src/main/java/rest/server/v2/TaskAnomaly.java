package rest.server.v2;

/**
 * A task in one execution that did not finish cleanly.
 *
 * @author joao
 */
public class TaskAnomaly {

    public enum Status {
        /** Still RUNNING — either genuinely in flight, or stuck. */
        RUNNING,
        /** Reached FINISHED_WITH_ERROR; errorMessage usually says why. */
        FINISHED_WITH_ERROR
    }

    private final int taskId;
    private final String transformationTag;
    private final Status status;
    private final String errorMessage;

    public TaskAnomaly(int taskId, String transformationTag, Status status, String errorMessage) {
        this.taskId = taskId;
        this.transformationTag = transformationTag;
        this.status = status;
        this.errorMessage = errorMessage;
    }

    public int getTaskId() { return taskId; }
    public String getTransformationTag() { return transformationTag; }
    public Status getStatus() { return status; }
    public String getErrorMessage() { return errorMessage; }
}
