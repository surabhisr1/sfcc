<div class="c-callout">
  <p>
    <strong>Note:</strong> The Server-Side Rendering Performance series is designed to dive into the most important topics you'll encounter while building, testing and deploying a server-side rendered Progressive Web App (PWA). To learn how these PWAs differ from Mobify’s tag-loaded PWAs, read our <a href="../../architecture/#two-types-of-pwas">overview</a>.
  </p>
</div>

There are a few key tools you can access to debug your server-side rendered PWA’s local backend. Here, we’ll discuss the steps to access Chrome DevTools’ breakpoints and profiler.

## Using ssr:inspect to debug with breakpoints

With a simple command, you can use Chrome DevTools to debug the local backend of your server-side rendered PWA. Here are the steps:

1. Open your favorite command line interface
2. Navigate to the following directory:
- For projects that began prior to March 28 2019, navigate to your project’s web directory.
- For projects that began on March 28 or later, navigate to your project’s packages/pwa directory.
3. Once you’re in the correct directory, run the following command:
- For projects that began prior to March 28 2019, run `npm run ssr:inspect`.
- For projects that began on March 28 or later, run `npm run start:ssr:inspect`. Running this command allows you to use DevTools to inspect the processes that are running in the background.
4. Open your Chrome browser, and enter the URL [chrome://inspect](chrome://inspect).
5. The page will show a link for running the SSR server, click that link.
6. DevTools will open up in a new window, connected to running the SSR server.
7. [Add breakpoints throughout the file](https://developers.google.com/web/tools/chrome-devtools/javascript/breakpoints), and inspect. As the server runs the PWA, use the **Console** within the DevTools window to view messages, errors and warnings from the server. (Notice that the console logs the same messages as the command line interface. The main advantage of using the console is that it allows you to leverage Chrome DevTools’ JavaScript debugging features.) To learn more about debugging with breakpoints, read the guide [Get Started with Debugging JavaScript in Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools/javascript/).

## Profiling the backend to pinpoint performance bottlenecks

Chrome DevTools’ [Profiler](https://developers.google.com/web/updates/2016/12/devtools-javascript-cpu-profile-migration) is another key tool for debugging your PWA. It provides a visual graph of all the JavaScript processes that run on the backend, highlighting how long each process takes to run. Because of the tool’s visual nature, you can use it to identify lengthy processes that may be affecting the performance of your PWA. To use the Profiler tool:

1. Complete the steps above to open the DevTools console.
2. Within the DevTools console, click on the **Profiler** tab.
3. Within the **Profiler** tab, click the record icon in the top left of the console. (If you hover over the record icon, the tooltip will specify “**Start CPU recording**”.)
4. Open another Chrome window, and navigate to the page you’re interested in profiling.
5. As the page loads, you will see messages logging in your command line interface. Once you stop seeing log activity, click the recording icon again to stop recording. Your recorded profile will appear within the DevTools window on the left, under **Profiles**.
6. Click on the profile you just recorded to access the visual graph. Here, you’ll see time on the x-axis, and the depth of the stack on the y-axis.
7. Now, you can use the x- and y-axes of the visual graph to help pinpoint performance issues.

### Diagnosing issues with the Profiler tool

The x-axis is the most important source of information in the chart, as the width of a given process will tell you the time that it takes to run. Zoom-in to any given section, and identify long-running processes with a goal of understanding why they may be slow. You can inspect whether it’s your code, from a dependency, or native code from the browser. In addition, the y-axis provides useful insights. If the stack is very tall you may want to evaluate if a process is too deep, as it relates to memory issues.

Learn more about the profiler and other techniques to analyze runtime performance in Google’s [Chrome DevTools documentation](https://developers.google.com/web/tools/chrome-devtools/rendering-tools/).

## Next steps

Next, you can continue through our Server-Side Rendering Performance series, with an article about [how to build cacheable SSR pages](../ssr-performance-caching-overview). Or, explore [best practices to optimize your PWA’s client-side performance](../client-side-performance/).

<div id="toc"><p class="u-text-size-smaller u-margin-start u-margin-bottom"><b>IN THIS ARTICLE:</b></p></div>