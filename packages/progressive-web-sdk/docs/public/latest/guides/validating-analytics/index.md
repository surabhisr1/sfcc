<div class="c-callout">
  <p>
    <strong>Note:</strong> This document is intended for Analysts at our partner and customer companies. We’ll walk you through how to ensure your analytics data is coming through as expected when your site is undertaking a soft launch or A/B test.
  </p>
</div>

## Introduction

When it’s time to launch your new Mobify application, it’s important to check that your application’s analytics have been implemented correctly. In our experience, projects that do not undertake these steps at launch often encounter errors in their analytics data later. By following these steps, you can ensure that your team’s data-driven decisions are based on a foundation of solid, validated data.

Validating your analytics data means asking yourself: for all the events you’ve implemented for your site, are they coming through in all of your analytics tools as expected (in the appropriate ratios) and do they make sense relative to each other?

<div class="c-callout">
  <p>
    <strong>Note:</strong> Before walking through these steps, ensure your development team has implemented any third-party analytics tools using Mobify’s <a href="../../analytics/analytics-integrations-overview/">Analytics Integrations</a> (for Mobify Platform versions 1.11.0 and later) or for earlier versions, <a href="../../analytics/legacy-analytics-manager/">the Analytics Manager</a>.
  </p>
</div>

## Start with validating sessions and pageviews

Sessions and pageviews are important to validate, as many other metrics depend on them. For single page applications like Progressive Web Apps (PWAs), they’re also the most likely source for analytics issues.

For sessions, you’ll want to ask yourself: is your sessions per user consistent with what it used to be, before your site became a single-page app? Has it increased significantly? For your bounce rate, is it consistent with what it was before? If you see large changes, there may be a problem with your sessions implementation. As a general rule of thumb, if you see a change to sessions per user or pageviews per session that’s approximately 15-30% different or more relative to before, it could indicate an analytics implementation issue. 

For pageviews, hone in on your pageviews per session as another key metric. For this, seeing the number of pageviews per session significantly increase or decrease from before could signal that pageviews were not implemented correctly. For example, seeing pageviews per session increase could mean you’re incorrectly sending double pageview events.

## Analyze key events that monitor the sales funnel

<div class="c-callout">
<p>
<strong>Note:</strong> In this section we reference some common ecommerce language:

- Product listing page: a page or screen that shows all products available within a certain category.
- Product details page: a page or screen which offers full details on a specific product, along with purchasing options and controls add to cart, add to wishlist, or buy immediately.
</p>
</div>

Next, it’s important to validate the metrics that monitor key aspects of your shopper’s journey through the sales funnel. These typically include:

1. Visits to the landing page
2. Visits to a product listing page
3. Visits to a product details page
4. Adding an item to the cart
5. Starting the checkout process
6. Completing a purchase

For each of the steps in your sales funnel, check to make sure that the number of users from a given step is less than the number of users from an earlier step. This is called the continuation rate, and the ratios between each step need to be less than 100%. For example, the number of shoppers visiting a product listing page should be fewer than the number of shoppers who land on your site. A common error is missing checkout start events. To spot this error, look for a continuation rate that’s **greater than 100%** between users that start checkout, and users that go on to make a purchase.

Next, you’ll want to investigate micro-conversions within the sales funnel. These are metrics such as your product details page view rate, add to cart rate, checkout start rate, checkout completion rate, and conversion rate, among others. Look to ensure that the data for these metrics is reasonable compared to the results from pre-launch, or if you’re conducting a soft launch or A/B test, relative to the other site you may be testing. In general, if data for one micro-conversion rate appears to be an outlier from other stages in the sales funnel, it’s a good idea to check your analytics implementation, as the event may have been duplicated.

As a final step to ensure your data is valid, we recommend a more granular and comprehensive test. In this step, you’ll finish validating your sales funnel events by comparing the number of events captured by your analytics implementation, to the actual events completed by visitors to your site. For example, we can validate the accuracy of the checkout start event by looking at the number of visitors to any checkout stage URL (for example URLs containing ‘checkout’), assuming that a visit to a checkout page means a user is starting the checkout process. This is a one-to-one check where you can expect equal counts of events to specific url views. If these counts don’t match, this could indicate a tracking issue, likely for events sent to your analytics implementation.

## Further reading

After completing these steps during launch, you can rest assured that your analytics data is trustworthy right from the start.

Still curious? Learn more about common issues you may encounter in analytics data in our blog article, [Common PWA Analytics Tracking Issues & How to Fix Them](https://www.mobify.com/insights/common-pwa-analytics-tracking-issues-how-to-fix-them/).

<div id="toc"><p class="u-text-size-smaller u-margin-start u-margin-bottom"><b>IN THIS ARTICLE:</b></p></div>

