
import {GateClass, Node} from 'dismantle/Gates/internal';
/**
 * A chip instance.
 */
abstract class Gate {

    /**
     * The special "true" node.
     */
    static readonly RUE_NODE: Node = new Node(-1);

    /**
     * The special "false" node.
     */
    static readonly FALSE_NODE:Node = new Node(0);

    /**
     * The special "clock" node.
     */
    static readonly CLOCK_NODE:Node = new Node();

    // the input pins
    protected inputPins: Node[] = [];

    // the output pins
    protected outputPins: Node[] = [];

    // the class of this gate
    protected gateClass: GateClass = [];

    // true if the inputs to this gate changed since the last re-computation.
    protected boolean isDirty;

    // A list of listeners to the isDirty property.
    private Vector dirtyGateListeners;

    /**
     * Adds the given listener as a listener to the isDirty property.
     */
    public void addDirtyGateListener(DirtyGateListener listener) {
        if (dirtyGateListeners == null)
            dirtyGateListeners = new Vector(1, 1);

        dirtyGateListeners.add(listener);
    }

    /**
     * Removes the given listener from being a listener to the isDirty property.
     */
    public void removeDirtyGateListener(DirtyGateListener listener) {
        if (dirtyGateListeners != null)
            dirtyGateListeners.remove(listener);
    }

    /**
     * Re-computes the values of all output pins according to the gate's functionality.
     */
    protected abstract void reCompute();

    /**
     * Updates the internal state of a clocked gate according to the gate's functionality.
     * (outputs are not updated).
     */
    protected abstract void clockUp();

    /**
     * Updates the outputs of the gate according to its internal state.
     */
    protected abstract void clockDown();

    /**
     * Marks the gate as "dirty" - needs to be recomputed.
     */
    public void setDirty() {
        isDirty = true;

        // notify listeners
        if (dirtyGateListeners != null)
            for (int i = 0; i < dirtyGateListeners.size(); i++)
                ((DirtyGateListener)dirtyGateListeners.elementAt(i)).gotDirty();
    }

    /**
     * Returns the GateClass of this gate.
     */
    public GateClass getGateClass() {
        return gateClass;
    }

    /**
     * Returns the node according to the given node name (may be an input or an output).
     * If doesn't exist, returns null.
     */
    public Node getNode(String name) {
        Node result = null;

        byte type = gateClass.getPinType(name);
        int index = gateClass.getPinNumber(name);
        switch (type) {
            case GateClass.INPUT_PIN_TYPE:
                result = inputPins[index];
                break;
            case GateClass.OUTPUT_PIN_TYPE:
                result = outputPins[index];
                break;
        }

        return result;
    }

    /**
     * Returns the input pins.
     */
    public Node[] getInputNodes() {
        return inputPins;
    }

    /**
     * Returns the output pins.
     */
    public Node[] getOutputNodes() {
        return outputPins;
    }

    /**
     * Recomputes the gate's outputs if inputs changed since the last computation.
     */
    public void eval() {
        if (isDirty)
            doEval();
    }

    /**
     * Recomputes the gate's outputs.
     */
    private void doEval() {
        if (isDirty) {
            isDirty = false;

            // notify listeners
            if (dirtyGateListeners != null)
                for (int i = 0; i < dirtyGateListeners.size(); i++)
                    ((DirtyGateListener)dirtyGateListeners.elementAt(i)).gotClean();
        }

        reCompute();
    }

    /**
     * First computes the gate's output (from non-clocked information) and then updates
     * the internal state of the gate (which doesn't affect the outputs)
     */
    public void tick() {
        doEval();
        clockUp();
    }

    /**
     * First updates the gate's outputs according to the internal state of the gate, and
     * then computes the outputs from non-clocked information.
     */
    public void tock() {
        clockDown();
        doEval();
    }

}

export default Gate;