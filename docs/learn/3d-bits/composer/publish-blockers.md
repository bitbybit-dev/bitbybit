---
sidebar_position: 11.5
title: "Why Publishing Was Refused"
sidebar_label: Publish Blockers
description: Every reason 3D Bits refuses to publish a project, and what to change to clear it.
tags: [3d-bits, composer, troubleshooting, deployment, errors]
---

# Why Publishing Was Refused

Publishing is refused rather than completed whenever going live would leave a shopper unable to buy, or leave you collecting the wrong amount of money. It is never a soft failure: the message names the option, the part, the control, the script or the product involved, and where a figure is at stake it names the figure.

This page lists every refusal and what to change. Many of them appear while you are still working, in the **Setup problems** bar on the bottom bar of Composer, so you can clear them long before you press Publish. The ones that have to look at your Shopify catalogue - stock, prices, variants - can only run at the moment you publish.

:::tip Refused is not the same as warned
A **warning** after a successful publish tells you something you should know - your configurator is live either way. A **refusal** means nothing changed on your storefront at all. If you see the word *blocked*, your shoppers are still seeing the previous version.
:::

## Before the request leaves Composer

Composer checks the configuration against its own rules first, so these never reach the app.

| The refusal | The fix |
|---|---|
| *"Cannot publish - the configuration does not match the schema (N problems). Open the issue list to see where."* | A **Blocking Publish** bar appears on the bottom bar. Open it, click a row, and it takes you to the field. Fix each one and press Publish again. |
| *"Cannot publish - the configuration has N problems."* | An ordinary form field is invalid. Use the **Needs attention** bar over the 3D view. See [Troubleshooting](./troubleshooting). |

## The project and its products

| The refusal | The fix |
|---|---|
| *"Link at least one product before publishing."* | Publishing from Composer opens Shopify's product picker for you - choose one or more products. If you cancel it, the project publishes anyway and gives you a URL you can place in a block on any page. |
| *"this project is not attached to any product, so the price shoppers would be charged cannot be checked. Attach a product on the project page."* | A different refusal from the one above, and a later one. A project with pricing switched off publishes happily with no product and gives you a URL, so cancelling the product picker is fine - but pricing has to compare the configured total against a real product's own price, so with pricing on there has to be one. Attach a product on the project page, or turn pricing off for this project. |
| *"'Other project' is already published to one of these products, and two projects cannot share one."* | One product can carry one published configurator. Unpublish the other project, or link this one to a different product. |
| *"Nothing to publish yet - edit and save the project first."* | The project has no saved draft. Open it in Composer, make your changes and save. |
| *"This project is already publishing - wait for it to finish before publishing again."* | A publish is in flight. Wait for it to report back rather than pressing again. |
| *"This project is too large to publish. Reduce the scene or split it into linked scripts."* | The configuration itself has grown too big. The usual cause is parsed glTF structure being carried for models that do not use it - see [Configuration size](./saving-and-publishing#configuration-size). |

## Linked scripts

| The refusal | The fix |
|---|---|
| *"Publish blocked - linked script 'Name' has no published version yet. Open it under Scripts and publish from the editor first."* | A Composer project always publishes a script's **latest published version**, so an unpublished script has nothing to reach for. Open it under Scripts and publish it. |
| *"script 'Name': its URL must use https."* | A script loaded from a URL must be served over https, or the storefront refuses to fetch it and the script silently never runs. Fix the address on the script. |
| *"Scripts require the Standard or Pro plan."* | This one is about publishing a script project itself. Upgrade, or remove the script. |

## Your layout

Publishing is refused when the option panel contains a duplicate that would make what a shopper sees and what they are charged disagree.

| The refusal | The fix |
|---|---|
| *"The control 'key' is placed twice in the layout."* | Only the first copy is ever updated, validated or priced, so a shopper could be shown one copy while the charge follows the other. Remove one of them. |
| *"Two layout elements share the id 'x'."* | Ids name the accordions and tab panels a shopper opens, and the translations attached to them, so a repeat makes the second element unreachable. Give one a different id. |
| *"The tab strip ... has two tabs with the id 'x'."* | A shopper's tab selection is remembered by that id, so the wrong tab opens. Give one a different id. |

## PDF documents

| The refusal | The fix |
|---|---|
| *"PDF reports require the Pro plan. Upgrade your subscription or disable both PDF report documents in the Composer before publishing."* | Turn off both documents in **GUI → PDF Reports**, or move to Pro. Note that it is having a document *enabled* that blocks, not having one configured. |

## Conditions that decide money

A condition that decides whether something is charged has to be one that checkout can re-derive from the final configuration on its own. Conditions that only decide what a shopper *sees* are unaffected by all of these - the restrictions apply where the condition also moves the price.

| The refusal | The fix |
|---|---|
| *"priced gating cannot use the expression editor - rebuild it with structured conditions."* | Turn the free-text expression back into the structured **Equals / Not Equals / Includes** rows. |
| *"priced gating cannot use history functions (prev/changed/initial)."* | A price cannot depend on what the shopper chose a moment ago, only on what they end up with. Rework the condition around the final selection. |
| *"priced conditions cannot use `{{id}}` placeholder input names."* | The placeholder is fine for a condition that only shows or hides something, and it is refused the moment that condition also decides a charge. Reference the control's own key instead. |
| *"logic rule 'x' force-shows the priced option 'y', which also has its own visibility or enablement condition."* | The charge follows the option's own condition, not the rule, so the shopper would receive the option without paying for it. Remove the option's own condition and let the rule own it, or drop the rule's visible/enabled override. The same applies to a force-shown or force-enabled priced control. |
| *"a while-matching condition cannot use history functions."* | Move it to an on-change rule. |
| *"effect 'x' is one-shot and not allowed on a while-matching rule."* | Setting a value, resetting one or running a script happens at a moment. Move it to an on-change rule. |
| *"effect 'x' is a persistent state and not allowed on an on-change rule."* | Showing, hiding, gating and driving 3D state are conditions that hold. Move them to a while-matching rule. |
| *"blocking logic messages cannot gate add-to-cart when no GUI renders on the storefront."* | Render at least one control or layout element, or drop the blocking message. |
| *"watches 'x', which is not the key of any control."* | Usually a renamed or deleted control. Point the rule at a key that exists. |

## Parts

These come from **GUI → Parts**. See [Parts](/learn/3d-bits/composer/gui/parts) for what each field does.

:::note These arrive wrapped in one message
The refusals in this table and in the next one are collected together and reported as *"Publish blocked - the pricing configuration has values that cannot be charged: ..."*. The message names up to five of them and then says *"and N more"*, so if you have a lot, clear the ones you can see and publish again to reveal the rest.
:::

| The refusal | The fix |
|---|---|
| *"two parts share the id."* | Ids attach a part to its parent, so a repeat puts a child under the wrong one. Give one a different id. |
| *"belongs to a part that is not in the list."* | Pick its parent again, or clear it so it becomes a top-level part. |
| *"is inside itself."* | A part cannot be its own parent, directly or through its ancestors. |
| *"is nested too deeply."* | Flatten the assembly. The message names the limit. |
| *"and the parts it sits inside multiply out to N."* | A child's quantity multiplies its parents'. Lower a quantity somewhere in the chain. |
| *"cannot carry its own price and a linked product at the same time."* | A linked product's price is the one that is charged, so a typed price alongside it would be silently ignored. Clear one of them. |
| *"is charged, so its quantity has to be a whole number of things to ship."* | Something is shipped or charged for this part, so it cannot be 2.5 of something. A part with no price and no link may hold a measurement. |
| *"is priced and marked as already part of the base price, but it links no product."* | Nothing would ship and nothing would be charged - the price would vanish. Clear the flag so the price is charged, or link a product. |
| *"cannot be negative - a part adds to the price, it does not subtract."* | Use a price formula for a reduction. |
| *"unitCode is not one of the units a part can be counted in."* | A part is counted, never measured out, so the length, area, volume and mass units are not available. |

## Priced options and quantities

| The refusal | The fix |
|---|---|
| *"two controls share the key."* | Keys identify what is charged, so they must be unique. |
| *"has two options with the value 'x' - the total would count both while the cart charges one."* | Give one a different value. |
| *"an option may link at most 10 products."* | Split the choice, or move some of the items into Parts. |
| *"is on a control which draws no quantity stepper."* | A shopper quantity belongs on a dropdown, radio or checkbox option. |
| *"is on a control the theme renders itself, so no stepper is drawn."* | Switch the control to one 3D Bits draws, or drop the quantity. |
| *"is already the key of another control or option."* | A shopper quantity travels under its own input name. Rename one of them, or the two overwrite each other and change what is charged. |
| *"min is above its max"* / *"defaultValue is outside the allowed range."* | Correct the range on the option's quantity. |
| *"nests conditions more than 10 deep - checkout cannot evaluate it."* | Simplify the condition. |
| *"the most this option can charge ... stops being represented exactly."* | Lower its price, its linked quantity, or its maximum quantity. |

## Turning the price into a real charge

These run at the moment you publish, and most of them read your Shopify catalogue to do it. [Charging methods](/learn/3d-bits/pricing/charging-methods) explains the methods they refer to.

| The refusal | The fix |
|---|---|
| *"the pricing configuration has values that cannot be charged: ..."* | The pricing values themselves did not pass their checks, before Shopify is touched at all. The problems it names are the ones in the [Parts](#parts) and [Priced options and quantities](#priced-options-and-quantities) tables above - up to five of them, then *"and N more"*. |
| *"the configured price could not be provisioned for real charging: ..."* | The chosen charging method cannot express this configuration. The message says which part of it. Change the configuration, pick a different method, or turn pricing off for this project. |
| *"some linked prices are missing, so the displayed price would not match what is charged."* | Re-link the products in the Composer so each link carries a price, and publish again. |
| *"shoppers could not add these to the cart at all, because the linked product costs more than the option charges."* | Raise the option's price to at least the linked product's, or unlink it and charge a plain price. |
| *"a product linked to option 'x' no longer exists, and that option ships several products together."* | Re-link or remove that product. With a single link the app falls back to charging without shipping and only warns; with several it refuses, because it would collect the full price and ship none of them. |
| *"a product linked to option 'x' could not be read from Shopify (...), so it cannot be confirmed that the products this option ships would reach the order. Please try publishing again."* | Not the same as the row above: Shopify could not be asked, rather than answering that the product is gone. Publishing again is the remedy. |
| *"shoppers could not add this to the cart at all: 'part' is linked at the product level, not a specific variant"* | The cart line would carry a product id where a variant id is required, so every add to cart would fail with *Cannot find variant*. Open each part the message names in **GUI → Parts** and pick a variant of that product, or clear the link and give the part its own price. |
| *"shoppers would get 'Cannot find variant' at add-to-cart."* | A product the configuration charges through is not purchasable - deleted, unpublished, or with no available variant. The message names each one. |
| *"the variant matrix needs a linked product on this project."* | Link a product, or use a different charging method. |
| *"Variant matrix charging generates variants on ONE product, and this project is linked to several."* | Link one product per project for the variant matrix, or use Product lines charging. |
| *"the generated variant matrix produced no matchable variants."* | There is nothing for the matrix to build from. Check the priced options, or use a different method. |
| *"this configuration cannot be charged ..."* | The displayed total does not cover the product's own Shopify price plus everything the configuration adds, so the cheapest configuration could not be added to the cart. The message names the exact figure to raise the base price to. |
| *"... over what one cart line can carry - shoppers choosing it would get no cart at all."* | Too much of the total is being collected through a hidden helper line. Lower the configured total, or raise this product's own price by the amount the message names, which moves that money onto the product's own line. |
| *"the configured pricing rules are ... over what is needed to verify a cart at checkout."* | Your pricing has more priced options and visibility conditions than checkout can carry. Reduce them, or switch to Bundled parts, Variant matrix or Single line charging. |
| *"could not verify the companion charge products are purchasable (...). Please try publishing again."* | The check that confirms the hidden charge products can still be bought could not be run. Nothing is wrong with your configuration. Try publishing again. |
| *"the store's currency could not be read from Shopify."* | A transient Shopify problem. Try publishing again. |
| *"could not read this product's own price."* | Same - try again. If it persists, the product may have been deleted or hidden from the app; check it on the project page. |
| *"a product this project is attached to no longer exists, or the app can no longer see it."* | Remove it from the project on the project page, then publish again. |
| *"a product this project is attached to has more variants than can be checked."* | Attach a product with fewer variants, or use Single line or variant matrix charging. |

## Store-side plumbing

These are rare, and none of them is caused by anything you authored.

| The refusal | The fix |
|---|---|
| *"pricing enforcement could not be provisioned ... Try publishing again."* | A step against Shopify failed part-way. Publishing again is the remedy and is safe to repeat. |
| *"the metafield definition could not be created, so checkout could not read it."* | Try publishing again. |
| *"the metafield definition exists without storefront read access."* | An earlier version of the app, or a manual edit, left one of the definitions 3D Bits needs without read access, and checkout would read it as empty. Delete the pricing metafield definitions the message names in your Shopify store settings, then publish again - the app recreates them correctly. |
| *"the checkout validation could not be activated, so tampered carts could not be blocked."* | The app needs reinstalling or reauthorising. Open it from your Shopify admin, accept any permission prompt, and publish again. |
| *"... could not be activated, so Single line pricing would silently charge the product's native price."* | The mechanism Single line charging depends on is not available on this store right now. Publish again, and if it persists, reauthorise the app or switch to Product lines or variant matrix charging. |
| *"... and without it a bundle never expands - the shopper would be charged this product's own price and receive none of its parts."* | The same mechanism, needed by Bundled parts charging, is not available right now. Publish again, and if it persists, reauthorise the app or switch to Product lines charging. |
| *"one part of the bundle ships ... units, over the ... one nested part may carry"* | With Bundled parts charging, Shopify limits how many of one part a bundle may hold. Lower that part's quantity per set, or charge through Product lines instead. |
| *"a shopper may order up to ... of this configuration, and past ... one of its parts ships more than the ... units a nested part may carry"* | Your quantity control lets shoppers ask for more of the configuration than the bundle can hold. Set the control's maximum to the number the message names, or lower that part's quantity per set. |
| *"the checkout pricing rules disagree with the displayed price. This is an internal error - please contact support."* | Exactly that. Send us the project and we will look at it. |

## Still refused, and none of these fits

Take the message verbatim and send it to [info@bitbybit.dev](mailto:info@bitbybit.dev), along with the project file from **Files → Download project file**. Every refusal is deliberate and traceable, so there is always a specific answer.

For the pricing ones, [Pricing troubleshooting](/learn/3d-bits/pricing/troubleshooting) has more context on why each check exists.
