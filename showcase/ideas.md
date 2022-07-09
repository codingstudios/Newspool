# Ideas
Ideas for this project, feel free to create an issue to suggest any features.
Ideas that will not be implemented may have a solution for it !

## Features/Ideas that will be implemented soon
- Well Documented Setup Process (Reason: No time for that, sorry)
- Search for topics, titles (In queue)

## Features that will not be implemented 
- Voice Over - Text to Speech (Reason: May not work on some browsers)
  - You can actually add the function by yourself:
    ```js
    // text is not defined, create an element picker, get the content and set the content as text
      speechSynthesis.speak(
        new SpeechSynthesisUtterance(text.replace(/\s/g, " "))
      )
    ```
    
