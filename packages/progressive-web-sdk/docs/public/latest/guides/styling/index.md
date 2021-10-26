<!--

Our goal for intro is to provide the reader enough information to be dangerous:

1. Loader injects `main.css`: https://github.com/mobify/platform-scaffold/blob/develop/web/app/loader.js#L452-L459
2. We configure webpack:
    a. Setup PostCSS: https://github.com/mobify/platform-scaffold/blob/8e5bfee1cc6d91c9e0ac663a964b64615f056184/web/webpack/base.common.js#L20-L25
    b. Applies Configuration: https://github.com/mobify/platform-scaffold/blob/develop/web/webpack/base.main.js#L80-L84
    c. Applies Dev Config: https://github.com/mobify/platform-scaffold/blob/develop/web/webpack/dev.js#L20-L27
    d. OR applies Prod Config: https://github.com/mobify/platform-scaffold/blob/develop/web/webpack/production.js#L52-L59
3. Run webpack on `stylesheet.scss`: https://github.com/mobify/platform-scaffold/blob/8e5bfee1cc6d91c9e0ac663a964b64615f056184/web/app/stylesheet.scss

-->

__This guide explores using SCSS to style the PWA.__

Generated projects include styling for Mobify's fictional PWA [Merlins Potions](https://www.merlinspotions.com).

You can change its styles to better represent your brand.

> Progressive Web Apps bring [__app-like experiences__](https://docs.mobify.com/design/design-phase/pwa-patterns/) to the web. Create fast, fluid, frictionless experiences that are indistinguishable from native apps. _This includes styling transitions between pages while data is loading!_

<table>
    <thead>
        <tr>
            <th>Preloader</th>
            <th>Container</th>
            <th>Container with Data</th>
            <th>Container with Hero</th>
            <th>Complete</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><img src="1-preloader.jpeg" alt="Image"></td>
            <td><img src="2-container.jpeg" alt="Image"></td>
            <td><img src="3-container-with-data.jpeg" alt="Image"></td>
            <td><img src="4-container-with-hero.jpeg" alt="Image"></td>
            <td><img src="5-complete.jpeg" alt="Image"></td>
        <tr>
    </tbody>
</table>

The generated project includes a stylesheet `main.css` in `web/app/loader.js`.

On `npm start`, webpack creates `main.css` by applying [Sass](https://sass-lang.com/) and [PostCSS](http://postcss.org/) to `web/app/stylesheet.scss`. _It also watches for changes and you can refresh to see._

Style the PWA by changing its imports:

1. SCSS variables
2. Component styles
3. Preloader styles

## SCSS Variables

<!-- https://github.com/mobify/platform-scaffold/blob/develop/web/app/styles/_variables.scss -->

Colors, fonts, weights, breakpoints and shared values are set in  `web/app/styles/_variables.scss`.

_Changing this file is the best way to start branding your PWA!_

## Component styles

<!-- Local Components: https://github.com/mobify/platform-scaffold/tree/develop/web/app/components -->

**Local component** SCSS files are in `web/app/components`. Local components use the class name prefix `c-`.

<!-- SDK Components: https://github.com/mobify/platform-scaffold/tree/develop/web/app/styles/themes -->

The SCSS files for our [SDK components](../../components/all/) are in `web/app/styles/themes/pw-components`. For styling SDK components, use the class name prefix `pw-`.

> Some SDK components do not have an SCSS file. Customize them by creating one and importing it in `web/app/styles/themes/_pw-components.scss`.

<!-- Container Components: https://github.com/mobify/platform-scaffold/tree/develop/web/app/containers -->

**Container component** SCSS files are in `web/app/containers`. Container components use the class name prefix `t-`.

## Preloader styles

<!-- Preloader: https://github.com/mobify/platform-scaffold/blob/develop/web/app/preloader/preload.css -->

The Preloader is shown while the PWA starts.

_It should be light-weight, both visually and in file-size._

The Preloader CSS file is `web/app/preloader/preloader.css`.

> The Preloader uses CSS, not SCSS like the rest of the PWA.

## Referencing assets in SCSS

To reference images in SCSS, use a path relative to `web/app` regardless of where the source file is located.

For example, to reference `web/app/static/img/global/image.png`:

```css
.c-banner {
    .c--free-ship {
        background-image: url('./static/img/global/free-shipping-banner.png');
    }
}
```

<div id="toc"><p class="u-text-size-smaller u-margin-start u-margin-bottom"><b>IN THIS ARTICLE:</b></p></div>