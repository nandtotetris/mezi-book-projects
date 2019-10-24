
# working directory for HDL definitions
In the java implementation user-built hardware components were read, when encountered during the parsing of an HDL file, from the current working directory (often this is the directory from which either the test script or the program file is loaded from).

In the web app, what is the working directory? There is no such thing. Maybe local storage; put the HDL of components into local storage as soon as they are uploaded. Actually, there is no other option if the components are not known ahead of time. In the long run, these component files can be uploaded into some central repository, or into a database space of the current user. The repository, or the database, could also be potentially where the builtin component definitions should be stored; it would be like the npm repository, but for hardware components.

So when trying to decide between a builtin and a user-defined component, first look for the component in the local storage (in case the user has uploaded one). If the component is not in the local storage, use its builtin definition. 

So, whenever the java implementation instantiates a component by reading its definition from a file, provide a similar content either from local storage or from an imported json file, or from a database/repository, or from whatever source a running javascript instance is able to access.

# interaction between UI and component model
In the java implementation, any code from any class can update a GUI, as long as it holds a reference to it. Can we do the same thing in the web app?

Of course, in the web app context as well, any code from anywhere can manipulate the dom anyway it wants to. So, there should be no reason why this can't be possible in react as well. One pattern with react is that it seems to decouple user interface from business logic. The business logic can simply update some component's state, and the UI change will in turn reflect the the component's recent state.

So whenever calls to UI component's are made from within a business logic in java, a corresponding state update call should be made from within react. That means you would have to not only know what state change to make to produce a similar effect, but also have to know to properly utilize it wherever it is needed in the UI.

Do we have any other option? Maybe. We can simply ignore the UI manipulation calls, and focus on getting the business logic right. Then test the business logic independently, and afterwards, move on to integrating the react UI comoponent with the business logic.

There is still another option. Mock the java UI classes, and maybe do just a console log within their mocked methods. This can however get nasty quickly, if we try to mock every method of some swing component. But if the nastiness is moderate, the state update calls then can be made from within these mocked methods. And the mock classes will serve as the glue between the business logic and the react UI component.

In local storage a gate might be represented with a json like this:
```
{
  "name": "Mux",
  "hdl": "blah blah"
}
```
# use their assembler
How about the assembler? Imitate their assembler or develop one from sccratch? Their assembler might have additional features, such as parsing a compare, and or a test file, and running a comparison against it. Will these features ( a compare file, and test files) be relevant in the light of the bigger picture? I mean testing is an integral part of a sustainable development, so yeah, they will definitely be needed. __ yeah, some weeks later, theirs was susccessfully replicated.

# translator's logic is intertwined with the GUI
The java implementations of the translators are also interlinked with the GUI that controls their actions. When turning these into web apps, we will have to find some mechanism (say passing around callbacks, or state values) to achieve a similar interaction.

# calls to core java libraries 
What do we do when the java implementation extends native java classes, or interfaces? Maybe just try mocking their interfaces by providing an equivalent service.

# java threads, equivalent in javascript?
= What is the equivalent of a java Thread in typescript? Javascript is normally single threaded, unless something like a web worker is used. Well they are called worker threads, they run off a javascript file (or url path) containing a function. You can exchange messages with them ... so if the need really comes to it, you can spawn a couple of them worker threads.

# what should come after the assembler?
There are two possible next steps: either go up and build a compiler that translates a high level language code into an assembly code, or go down and build a simulator that can run the translated machine code by simulating the underlying hardware (which can be done by reading it either from an hdl file or by using builtin hardware models). The later option promises more exciting and interesting, and henece, we shall get started with it at once.

# A closer look into the hardware simulator
So the GUI of the hardware simulator seems divided into two main sections: *controller* and *simulator*. The controller GUI, as its name suggests, is concerned with controlling the simulation; like setting it up, configuring it, tweaking it, and modifying it. The simulation GUI on the other hand deals with displaying the dynamic evolution of data processing that is being simulated.

**How do I test the hardware simulator?** Well, by giving it an HDL design of the hardware, and then by providing it with a test script that commands the hardware to do certain things, and then by comparing the hardware outputs with expected outcomes listed in a compare file.

For the time being, I don't need none of the fancy simulator or controller displays. I will just put the test script, the hdl, and the compare file in local storage and all I want is a console log that communicates either error or success; as the case might be.

The class *HackController* is the glue that binds the simulator and controller components. So _start your development from it_.

You can implement the *HardwareSimulatorComponent* by leaving out the implementation details of the interface methods, you can leave them either with an empty body or can do a simple console log of the operation, and likewise with the *HardwareSimulatorControllerComponent*.

So, from which end would you like to start?  From the component's end or from the interface's end? Last time, with the assembler, I got started from the interface's end. Let's this time get started from the component's end (the UI's end) and see where it will lead me, or see whether starting from the UI end will prove rewarding or not.

# mapping a swing UI into a react component
I am just saying, you have to try it. A perfect and direct mapping between a swing application and a react app. Why can't swing components be directly mapped into react components? What is the catch? You should go for it, and stop when you get stuck. But for now, focus on getting the functionality right (by manually calling what would have been invoked following a button's click).

# next step
- Retrace each chapter's project by way of revision, from the last chapter (the operating system) backward to the earliest of chapters (MUX designs).
  1. **The Operating System** and the **compiler**
  *How should they be tested?* 
  - Compile all the OS jack files using your compiler
  - Run all the OS tests using your compiled OS
  - Run all the compiler tests using your compiled OS
  - The test jack files should also be compiled using your compiler
- Plan how to integrate all of the projects into a unifing react app. Do integrate, and bring something cool to life.
