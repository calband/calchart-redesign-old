{% load wikitags %}

## Manual adjustments

After <a href="{% page 'editing-dots/selecting-dots' %}">selecting dots</a>, you can use the selection tool <i class="icon-mouse-pointer"></i> to click and drag dots to a new location.

You can also use the arrow keys to nudge dots by a step (shift + arrow nudges by 4 steps).

To swap two dots, use the Swap tool <i class="icon-exchange"></i> (shortcut: W). Clicking on two dots consecutively will swap the two dots' positions.

## Positioning tools

There are four tools available to easily position dots.

The line tool <i class="icon-line"></i> (shortcut: L) positions the selected dots in a line. Click down on the position for the first dot, then drag to the desired interval between each dot. For example, to put dots in a line with two step spacing, click and drag two steps.

The arc tool <i class="icon-arc"></i> (shortcut: A) positions the selected dots in an arc. Click down on the center (origin) of the arc and drag to the start of the arc. After releasing, moving the mouse should distribute the dots around an arc. Clicking again will save the dots at that location.

The block tool <i class="icon-rectangle"></i> (shortcut: B) positions the selected dots in a block. Click down on the desired position for the top-left corner of the block, then drag either horizontally or vertically. If dragging horizontally, you will be deciding the number of columns the block should have, distributing the dots accordingly. Dragging vertically determines the number of rows.

The circle tool <i class="icon-circle-o"></i> (shortcut: C) positions the selected dots in a circle. Click down on the origin of the circle and drag to determine the radius of the circle.

## Snap to grid

Most of the positioning tools will snap dots to the grid, as set in the toolbar. For example, using the line tool with a snap grid of 2 will snap the first dot to the closest 2-step coordinate and the dot spacing will snap to intervals of two steps.

After positioning dots, you might end up with dots being off the grid. You can click the resnap button to put dots back on the grid.
