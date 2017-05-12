{% load wikitags %}

To start editing continuities, click the <i class="icon-pencil-square-o"></i> icon in the toolbar. This loads the continuity editing context.

## Run continuities

To step through the stuntsheet's continuities, use the seek bar in the toolbar. The left and right arrows in the toolbar and the keyboard go to the previous and next beat, respectively.

The up arrow on the keyboard will skip to the last beat of the stuntsheet, and the down arrow will skip to the first beat.

## Check continuities

To check for any errors in the continuities, you can click the <i class="icon-check"></i> icon in the toolbar, which will show a message if there are any errors in the current set of continuities. Some of these errors include a dot not reaching its next spot, or running out of things to do.

## Edit continuities

When in this context, a panel is displayed, containing a tab for each dot type. Clicking on a tab will display the continuities for that dot type.

There are also two tabs labelled "All". Put continuities in the first "All" tab to add continuities for all dots at the beginning of the stuntsheet. Put continuities in the latter "All" tab to add continuities at the end of the stuntsheet.

Use the dropdown in the panel to add a continuity for the selected dot type. The dropdown also features a search bar to quickly filter the list of continuities.

To edit a continuity, click the <i class="icon-pencil"></i> icon, which will display a popup containing properties for that specific continuity. Every continuity has the following fields in the popup:

- **Step type**: The type of marching for movements in this continuity, overriding the step type of the stuntsheet.
- **Beats per step**: The number of beats per step for this continuity, overriding the number of beats per step for the stuntsheet.
- **Custom continuity text**: Every continuity renders a default message for poopsheets. Use this textbox to change the message that should be rendered for the continuity.

To remove a continuity from a dot type, click the <i class="icon-times"></i> icon.

To reorder a continuity, right click on the continuity and select either "Move up" or "Move down", which will move the continuity up or down the list.

## Available continuities

{% for child in page.children %}
- [{{ child.name }}]({{ child.get_url }})
{% endfor %}
