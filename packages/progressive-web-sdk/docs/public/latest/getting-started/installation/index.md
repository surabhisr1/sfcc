<div class="c-callout c--important">
  <p>
    <strong>Important:</strong> Our installation instructions have been updated to reflect many new technologies released starting in November 2018. If you need to install a project that was generated <em>before</em> November 2018, you can still access the <a href="../quick-start">old Quick Start</a> guide.
  </p>
</div>

## Supported operating systems

The Mobify Platform supports the following operating systems:

- macOS 10.13 or greater
- Windows 7 or greater
- Ubuntu Linux 18.x or greater

## Recommended hardware

We recommend the following for your hardware setup, at a minimum:

- 16 GB RAM
- Solid-state drive (SSD)
- 2 or more CPU cores

## Installing required software

Before you start development, you’ll need to install the following software on
any computers you plan to use for development:

<div class="tabs tabs-1 tabs-line">
<ul>
  <li><a href="#tabs-1-windows">Windows</a></li>
  <li><a href="#tabs-1-mac">Mac</a></li>
  <li><a href="#tabs-1-linux">Linux</a></li>
</ul>
<div id="tabs-1-windows">

<p class="u-margin-bottom">
  Start by installing Node 10.17.0:
</p>

- Download our recommended version of Node, version 10.17.0:
  - [Download](https://nodejs.org/download/release/v10.17.0/node-v10.17.0-x64.msi) for 64-bit machines
  - [Download](https://nodejs.org/download/release/v8.10.0/node-v8.10.0-x86.msi) for 32-bit machines

  (These links will directly download the compatible `.msi` file for your machine.)
- Run the installer and complete the setup instructions after downloading.
- When prompted by the installer, accept the default option to also install the Node.js runtime and Node Package Manager (npm), and to add the runtime to your path. This will give you npm version 6.11.3.
- Open your Command Prompt and run `node -v`.
- Confirm that Node 10.17.0 has been installed successfully.

<p class="u-margin-top u-margin-bottom u-text-size-small">
  If you already have a newer version of Node installed, you should be able to use it instead of version 10.17.0. However, with server-side rendered PWAs, you must make sure that your code is compatible with Node 10.17.0. Also, you should test your work extensively in a staging environment before publishing anything into production because the production Lambda will be running the most recent LTS version of Node 10.
</p>

<p class="u-margin-top u-margin-bottom u-text-size-small">
  For best results, we do <em>not</em> recommend using Corey Butler's Node Version Manager (nvm) for Windows. In our testing, installations are more often successful by installing Node directly <em>without</em> using nvm.
</p>

<p class="u-margin-bottom">
  Next, install Node Package Manager (npm) 6.11.3, which is required for developing with the Mobify Platform.
</p>

- Open your Command Prompt and run `npm install -g npm@6.11.3`
- Run `npm -v` to confirm that npm 6.11.3 has been installed successfully

<p class="u-margin-bottom u-margin-top">
  If you don't have these programs already, you will also need to install:
</p>

- [Git for Windows](https://git-scm.com/downloads)
- [Google Chrome](https://www.google.com/chrome/) and the following extensions:
    - [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)
    - [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)
- Your favorite text editor. We recommend [Visual Studio Code](https://code.visualstudio.com/download)

</div>

<div id="tabs-1-mac">

<p class="u-margin-bottom">
  Start by installing Node 10.17.0:
</p>

- [Download](https://nodejs.org/download/release/v10.17.0/node-v10.17.0.pkg) our recommended version of Node, version 10.17.0. (This link will directly download the compatible `.pkg` file.)
- Run the installer and complete the setup instructions after downloading.
- Open your terminal and run `node -v`
- Confirm that Node 10.17.0 has been installed successfully.

<p class="u-margin-top u-margin-bottom u-text-size-small">
  If you already have a newer version of Node installed, you should be able to use it instead of version 10.17.0. However, with server-side rendered PWAs, you must make sure that your code is compatible with Node 10.17.0. Also, you should test your work extensively in a staging environment before publishing anything into production because the production Lambda will be running the most recent LTS version of Node 10.
</p>

<p class="u-margin-top u-margin-bottom u-text-size-small">
  If you're using Node Version Manager (nvm) to install Node, then npm 6.11.3 will automatically be installed for you.
</p>

<p class="u-margin-bottom">
  If you don't have these programs already, you will also need to install:
</p>

- [Google Chrome](https://www.google.com/chrome/) and the following extensions:
    - [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)
    - [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)
- Your favorite text editor. We recommend [Visual Studio Code](https://code.visualstudio.com/download)

</div>

<div id="tabs-1-linux">

<p class="u-margin-bottom">
  Start by installing Node 10.17.0:
</p>

- Go to this link to download [Node
  10.17.0](https://nodejs.org/download/release/v10.17.0/)
- Download the right binary for your machine. (For example, if you have a 64-bit
  Intel machine, you would choose the x64 file.)
- Extract the binaries and complete the setup instructions after downloading.
- Open your terminal and run `node -v`
- Confirm that Node 10.17.0 has been installed successfully.

<p class="u-margin-top u-margin-bottom u-text-size-small">
  If you already have a newer version of Node installed, you should be able to use it instead of version 10.17.0. However, with server-side rendered PWAs, you must make sure that your code is compatible with Node 10.17.0. Also, you should test your work extensively in a staging environment before publishing anything into production because the production Lambda will be running the most recent LTS version of Node 10.
</p>

<p class="u-margin-top u-margin-bottom u-text-size-small">
  If you're using Node Version Manager (nvm) to install Node, then npm 6.11.3 will automatically be installed for you. This version will be enough for your Mobify project.
</p>

<p class="u-margin-bottom">
  If you don't have these programs already, you will also need to install:
</p>

- [Google Chrome](https://www.google.com/chrome/) and the following extensions:
    - [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)
    - [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)
- Your favorite text editor. We recommend [Visual Studio Code](https://code.visualstudio.com/download)

</div>
</div>

## Installing your project files

Next, we'll install a set of project files and get your development server
running on your machine. If you’re working on multiple machines, you’ll want to run through these steps on each one.

Most of the time, the project files will already be generated for you, and you will need to ask someone from your team to give you access to them. 

If you don't already have a set of project files to work from, please contact Mobify to request access to our `training-project` repository.

### Installing dependencies

Now we need to download and install package dependencies using Node Package
Manager (npm) by running the following command from your project directory:

```bash
npm install --quiet
```

<div class="c-callout">
  <p>
    <strong>Note</strong> It might take a few minutes before you see any activity in the terminal, so don’t cancel the process until it finishes. Thanks for your patience!
  </p>
</div>

## Additional steps for tag-loaded projects

Tag-loaded PWAs require a few additional steps before setup is complete. These include trusting the self-signed certificate, installing the Mobify Tag, and installing the Mobify Service Worker.

### Trusting the self-signed certificate

For tag-loaded projects, the development server uses a self-signed certificate to serve pages over HTTPS.

*If you don't trust the certificate on your machine, you will see HTTPS errors
in your browser that will block you from doing local development.*

Here’s how to trust the certificate on different operating systems:

<div class="tabs tabs-2 tabs-line">
<ul>
<li><a href="#tabs-2-windows">Windows</a></li>
<li><a href="#tabs-2-mac">Mac</a></li>
<li><a href="#tabs-2-mobile-safari">Mobile Safari</a></li>
<li><a href="#tabs-2-linux">Linux</a></li>
</ul>
<div id="tabs-2-windows">

1.  Select **Start Menu → Run** and enter `mmc.exe`
2.  Select **File → Add/Remove Snap-in**
3.  Select **Certificates** and click **Add**
4.  Select **Computer Account** and click **Next**
5.  Select **Local Computer** and click **Finish**
6.  Click **OK** to close the **Add or Remove Snap-Ins** dialog
7.  Expand the **Certificates** node and right-click on the **Trusted Root
    Certification Authorities** node
8.  Select **All Tasks → Import**
9.  Import the `localhost.p7b` file in `packages\pwa\dev-server`. *Leave all
     other settings as is while importing.*
10. After clicking **Finish**, you should get an alert saying "The import was successful"
11. Exit the window. *You do not need to save the console settings, so click
    **No** when prompted.*

</div>
<div id="tabs-2-mac">

1. Open your terminal and go to the `packages/pwa` directory inside your project directory
1. Run `open dev-server/localhost.pem`. *The Keychain Access app will now open.*
1. Add the certificate to your **login** keychain
1. In the Keychain Access app, search for "Mobify Development Server"
1. Right click it and select **Get Info**
1. Expand the **Trust** section
1. Set **Secure Socket Layer (SSL)** to **Always Trust**
1. Close the info window. *You will need to enter your password.*

</div>
<div id="tabs-2-mobile-safari">

<p class="u-margin-bottom">
  Before previewing your project on Mobile Safari, the certificate needs to be accepted in the browser.
</p>

1. Copy the address of the bundle location (for example,
   `192.168.0.1:8443/loader.js` for LAN previewing)
1. Open a new tab and go to the copied address
1. A warning screen will appear saying "This Connection Is Not Private"
1. Click **Show Details**
1. Click **Visit this website**
1. Confirm that the certificate has been accepted and that you access your
   project in the tab you opened previously

</div>
<div id="tabs-2-linux">

1. Open a Bash terminal
1. Go to the `packages/pwa` directory inside your project folder, and run the following commands:

```bash
# Install libnss3-tools for managing certs:
sudo apt-get install libnss3-tools
# Initialize a database of certificates
mkdir -p $HOME/.pki/nssdb
# Pass in a password (default we’re doing below is no password)
certutil -d $HOME/.pki/nssdb -N --empty-password
# Add trust for the cert:
certutil -d sql:$HOME/.pki/nssdb -A -t "P,," -n dev-server/localhost.pem -i dev-server/localhost.pem
```

We recommend closing the terminal window and re-opening a new one to ensure your changes are applied.

</div>
</div>

### Installing the Mobify tag

Before you can start development on a tag-loaded PWA, you, or someone on your team, will need to insert the Mobify tag into your site’s HTML.

#### Mobify Cloud project

Check that you have a project created for you in [Mobify
Cloud](https://cloud.mobify.com). If your project does not appear, contact
[Mobify support](https://support.mobify.com) to make sure that the project has been created and that you have been granted access to it as a team member.

After you have access to Mobify Cloud, make sure you can access your
project-specific Mobify tag by logging in to Mobify Cloud, then clicking the
**Tag** tab on the left-hand side navigation menu. This page provides you with the code you will need to add to your site's HTML.

#### Server access

To complete the setup, you will need to change the HTML sent by your web server to include the Mobify tag. If you’re not sure how to do this, ask your site’s administrator for help.

#### Deployment environments

Send [Mobify support](https://support.mobify.com) a list of any development, testing, and production
environments. A Mobify tag with multiple environments in place will be set up accordingly on Mobify Cloud, allowing you to select a target environment to deploy bundles of code when you’re ready to publish. If you’d like to add new environments later, a new tag will need to be generated after Mobify adds the new target. We do not need to replace old tags that have already been installed.

#### Steps to install the Mobify Tag

The installation process for the Mobify tag will be a bit different depending on your site's ecommerce backend:

<div class="tabs tabs-5 tabs-line">
<ul>
  <li><a href="#tabs-5-salesforce">Salesforce Commerce</a></li>
  <li><a href="#tabs-5-sap">SAP Hybris Commerce</a></li>
  <li><a href="#tabs-5-other">All others</a></li>
</ul>
<div id="tabs-5-salesforce">

If you’re working with a Salesforce Commerce backend, you can skip these steps because Mobify’s cartridge will install the Mobify tag for you. For more details, see [Commerce Integrations](../../integrations/commerce-integrations/#install-the-cartridge)

</div>

<div id="tabs-5-sap">

If you’re working with an SAP Hybris backend, you can skip these steps because Mobify’s extensions for SAP Hybris will install the Mobify tag for you. For more details, see [Commerce Integrations](../../integrations/commerce-integrations/#setting-up-the-sap-hybris-connector)

</div>

<div id="tabs-5-other">

<p class="u-margin-bottom">
  Add your project’s tag to the <code>&lt;head&gt;</code> tag of each page where you want to load the PWA:
</p>

```html
<!doctype>
<html>
<head>
    <title>Example Title</title>
    <meta name="title" content="Example Meta Title">
    <meta name="description" content="Example Meta Description">

    <!-- 📍 The tag goes here, early in the <head>, after SEO tags: -->
    <!-- MOBIFY -->
    <!-- ... -->
    <!-- END MOBIFY -->
</head>
<!-- ... -->
</html>
```

<p class="u-margin-top u-margin-bottom">  
  Verify that you placed the tag correctly by viewing the source of your pages and confirming that you see the tag within the HTML. Depending on your system, you may have to flush your cache, or rebuild pages for the tag to appear.  
</p>

<p class="u-margin-bottom">
  The Mobify tag works best when it is placed:
</p>

- Early in the `<head>` tag
- Above any external resources like JavaScript or CSS files
- Below SEO tags such as `<title>`, `<meta name="title">` and <br />`<meta
  name="title">`

</div>
</div>

### Installing the Mobify service worker

Service workers are web browser features that provide PWAs with some of their app-like superpowers, including the ability to work offline and to be installed to users' home screens, just like native apps. To realize the full potential of the Mobify Platform, tag-loaded PWAs will need to install the service worker (it comes pre-configured in server-side rendered projects). The installation steps will depend on your site's ecommerce backend:

<div class="tabs tabs-6 tabs-line">
<ul>
  <li><a href="#tabs-6-salesforce">Salesforce Commerce</a></li>
  <li><a href="#tabs-6-sap">SAP Hybris Commerce</a></li>
  <li><a href="#tabs-6-other">All others</a></li>
</ul>
<div id="tabs-6-salesforce">

If you’re working with a Salesforce Commerce backend, you can skip these steps because Mobify’s cartridge will install the Mobify service worker for you. For more details, see the cartridge section in [Commerce Integrations](../../integrations/commerce-integrations/#installing-the-cartridge-(for-tag-loaded-salesforce-b2c-commerce-projects)).

</div>

<div id="tabs-6-sap">

If you’re working with an SAP Hybris backend, you can skip these steps because Mobify’s extensions for SAP Hybris will install the Mobify service worker for you. For more details, see the extensions section in [Commerce Integrations](../../integrations/commerce-integrations/#installing-the-mobify-extensions).

</div>

<div id="tabs-6-other">

#### Steps to install the service worker

<p class="u-margin-bottom">Installing the service worker (the worker, for short) requires serving a JavaScript file over HTTPS from the <strong>root</strong> of your domain. You can do this in three steps:</p>

1. Find the code for your worker in your project:
   `packages/pwa/service-worker-loader.js`. Copy its contents.
2. On your server, create a worker file called `service-worker-loader.js` that
   is available from the root of your domain. For example, if your domain is
   example.com, the file must be `example.com/service-worker-loader.js`.
3. Paste the worker’s code (from step one) into the file you just created.  

#### Steps to verify that the worker is installed correctly:

1. Open your browser and navigate to the service worker over HTTPS. For example,
   if your domain is `example.com`, you would open
   https://example.com/service-worker-loader.js.
2. Check the worker opens using HTTPS without errors. *Service workers are
   [powerful features](https://www.w3.org/TR/secure-contexts/) that only work over secure connections.*
3. Check the worker is served *exactly* from the path
   `/service-worker-loader.js` **without redirection**. Redirects break the
   worker’s [scope](https://www.w3.org/TR/service-workers-1/#service-worker-registration-concept) by changing the URL where it is registered.
4. Check that the contents of the worker on your server **exactly** match the contents of the worker in your project.
5. Check the worker is served using the Content Type `application/javascript`.  

You can see an example of a correctly installed worker by opening this URL in your web browser:
[**https**://www.merlinspotions.com/service-worker-loader.js](https://www.merlinspotions.com/service-worker-loader.js)

<a href="https://www.merlinspotions.com/service-worker-loader.js"
target="_blank"><img src="correctly-installed-service-worker-example.png"
style="max-width: 80%" alt="Merlin's Potions worker is correctly installed"></a>


#### Troubleshooting

If it’s not possible to install the service worker during *development*, workarounds are possible using [Charles, an HTTP Proxy application](../../guides/developing-without-the-mobify-tag/).

In production, the service worker must be installed correctly. To get help with installation during production, contact support@mobify.com.


</div>
</div>


<div id="toc"><p class="u-text-size-smaller u-margin-start u-margin-bottom"><b>IN THIS ARTICLE:</b></p></div>