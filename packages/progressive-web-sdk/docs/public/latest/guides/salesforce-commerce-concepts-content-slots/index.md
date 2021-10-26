## Introduction  

<div class="c-callout">
  <p>
    <strong>Note:</strong> The Salesforce Commerce Concepts series is designed to dive into some of the more challenging topics you may encounter when working with Salesforce B2C Commerce. If you're new to working with Mobify's Salesforce Connector, we suggest reviewing <a href="../../integrations/commerce-integrations/#setting-up-the-salesforce-connector">our Salesforce Connector docs</a>.
  </p>
</div>

This guide builds on lesson two in this series, on [checkout](../salesforce-commerce-concepts-checkout). In this lesson, we will learn a workaround for accessing content slots, without risking the security issues associated with making a request with the Salesforce Business Manager password.

## Essential prerequisites  

To get the most out of this guide, make sure you:  

- If you’re *not* a backend developer yourself, you’ll need to make friends with one, as a lot of the tactics discussed in this guide require backend development expertise. Often, projects require changes to expose more data using requests to the Salesforce Commerce Cloud Open Commerce API, (OCAPI). The best case scenario is being able to work with a backend developer who understands the site’s OCAPI implementation. This will allow you to make changes to the site that will save you from having to scrape the data from desktop, or send multiple requests to get the same data.
- Complete our initial [Salesforce Connector setup steps](../../integrations/commerce-integrations/#setting-up-the-salesforce-connector).
- Have Salesforce B2C Business Manager access for the development environment (not the production environment). This is very useful for debugging and testing certain kinds of issues, such as when the availability of a product changes.
- Be able to access the [Salesforce Documentation](https://documentation.b2c.commercecloud.salesforce.com/DOC1/index.jsp), so you can pause and review the underlying API when necessary.

## The Shop API and the Data API

OCAPI provides you with access to two APIs: the Shop API and the Data API. The Shop API is what we need to use for building PWAs; for security optimization, the Data API **cannot** be used. When making a request to the Data API, you must include the Business Manager password. This creates a security risk, as this password would be visible to anyone inspecting the requests coming from the PWA.

When scoping your PWA, review the [Salesforce Documentation](https://documentation.b2c.commercecloud.salesforce.com/DOC1/index.jsp) to see which features are available in the Shop API and which are available in the Data API. If you require any feature from the Data API, you will need to have the backend team create custom endpoints to safely expose that functionality.


## Content slots

Normally, OCAPI exposes content slots using the Data API, which means that we can't access them. You can work around this by having the backend team create a custom endpoint that exposes the content. This endpoint accepts a slot id and returns the content for that slot. If you have multiple slots on a single page, the endpoint could also aggregate all of the slots together into a single response.

For example, the backend team could create endpoints like these to expose the content slots. You could request the content either by the slot ID or by the page where the content is used:

* `demandware.example.com/on/demandware.store/Sites-EU-Site/en_gb/Content-GetSlot?slot=global-promo-banner`
* `demandware.example.com/on/demandware.store/Sites-EU-Site/en_gb/Content-GetSlot?page=home`


## Wrap up

In this lesson, we learned about a workaround for accessing content slots, without using the Data API, and without creating security vulnerabilities.

To continue learning about Salesforce Commerce concepts, check out our next lesson, which is all about [Troubleshooting](../salesforce-commerce-concepts-troubleshooting).


<div id="toc"><p class="u-text-size-smaller u-margin-start u-margin-bottom"><b>IN THIS ARTICLE:</b></p></div>