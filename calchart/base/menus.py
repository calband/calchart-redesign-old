"""
Defines menus and toolbars used throughout the site, to be passed to templates as JSON strings in
script tags. Items in the menus/toolbars are represented by helper classes that output the HTML
for the menu/toolbar when rendered.

Menu and toolbar items are grouped into menu groups and toolbar groups, respectively. In the UI,
these groups will be separated by a line.

Actions are strings that represent an action defined in the associated ApplicationController
class. See ApplicationController._parseAction for more details.
"""

from django.templatetags.static import static as get_static_path
from django.utils.html import format_html, format_html_join, mark_safe
from django.utils.text import slugify

from base.constants import SNAP_OPTIONS, ZOOMS
from utils.general import collapse

### MENU CLASSES ###

class Menu(object):
    """
    A Calchart Menu, in the format

    <ul class="menu">
        # for each submenu
        {{ SubMenu.render }}
    </ul>
    """
    def __init__(self, *submenus):
        self.submenus = collapse(submenus)

    def render(self):
        return format_html(
            '<ul class="menu">{}</ul>',
            mark_safe(''.join(submenu.render() for submenu in self.submenus))
        )

class SubMenu(object):
    """
    A Calchart SubMenu, in the format

    <li class="menu-item">
        <i class="icon-{{ icon }}"></i>
        {{ name }}
        <div class="controller-menu submenu">
            # for each group
            <ul class="menu-group">
                # for each menu item, either SubMenu or MenuItem
                {{ item.render }}
            </ul>
        </div>
    </li>
    """
    def __init__(self, name, *groups, **kwargs):
        self.name = name
        self.groups = groups
        self.icon = kwargs.get('icon')

    def render(self):
        if self.icon is None:
            icon = ''
        else:
            icon = format_html('<i class="icon-{}"></i>', self.icon)

        menu_groups = mark_safe(''.join(self.render_group(group) for group in self.groups))
        return format_html(
            '<li class="{}">{}{}<div class="controller-menu submenu">{}</div></li>',
            self._get_classes(), icon, self.name, menu_groups
        )

    def render_group(self, group):
        return format_html(
            '<ul class="menu-group">{}</ul>',
            mark_safe(''.join(menu_item.render() for menu_item in group))
        )

    def _get_classes(self):
        return 'menu-item'

class SubMenuContext(SubMenu):
    """
    A Calchart SubMenuContext, in the format

    <li class="menu-item disabled {{ context }}-group">
        <i class="icon-{{ icon }}"></i>
        {{ name }}
        <div class="controller-menu submenu">
            # for each group
            <ul class="menu-group">
                # for each menu item, either SubMenu or MenuItem
                {{ item.render }}
            </ul>
        </div>
    </li>
    """
    def __init__(self, context, *args, **kwargs):
        self.context = context
        super().__init__(*args, **kwargs)

    def _get_classes(self):
        classes = super()._get_classes()
        return f'{classes} disabled {self.context}-group'

class MenuItem(object):
    """
    A Calchart MenuItem, in the format

    <li data-action="{{ action }}" class="menu-item">
        <i class="icon-{{ icon }}"></i>
        {{ name }}
    </li>
    """
    def __init__(self, name, action, icon=None):
        self.name = name
        self.action = action
        self.icon = icon

    def render(self):
        if self.icon is None:
            icon = ''
        else:
            icon = format_html('<i class="icon-{}"></i>', self.icon)

        return format_html(
            '<li data-action="{}" class="{}">{}{}</li>',
            self.action, self._get_classes(), icon, self.name
        )

    def _get_classes(self):
        return 'menu-item'

class MenuContextItem(MenuItem):
    """
    A Calchart MenuContextItem, in the format

    <li data-action="{{ action }}" class="menu-item disabled {{ context }}-group">
        <i class="icon-{{ icon }}"></i>
        {{ name }}
    </li>
    """
    def __init__(self, context, *args, **kwargs):
        self.context = context
        super().__init__(*args, **kwargs)

    def _get_classes(self):
        classes = super()._get_classes()
        return f'{classes} disabled {self.context}-group'

class Toolbar(object):
    """
    A Calchart Toolbar, in the format

    <div class="toolbar">
        # for each group
        {{ ToolbarGroup.render }}
    </div>
    """
    def __init__(self, *groups):
        self.groups = groups

    def render(self):
        return format_html(
            '<div class="toolbar">{}</div>',
            mark_safe(''.join(group.render() for group in self.groups))
        )

class ToolbarGroup(object):
    """
    A Calchart ToolbarGroup, in the format

    <ul class="toolbar-group">
        # for each item
        {{ ToolbarItem.render }}
    </ul>
    """
    def __init__(self, *items):
        self.items = collapse(items)

    def render(self):
        return format_html(
            '<ul class="{}">{}</ul>',
            self._get_classes(), mark_safe(''.join(item.render() for item in self.items))
        )

    def _get_classes(self):
        return 'toolbar-group'

class ToolbarContextGroup(ToolbarGroup):
    """
    A Calchart ToolbarContextGroup, in the format

    <ul class="toolbar-group hide {{ context }}-group">
        # for each item
        {{ ToolbarItem.render }}
    </ul>
    """
    def __init__(self, context, *items, **kwargs):
        items = collapse(items)

        super().__init__(*items, **kwargs)
        self.context = context

    def _get_classes(self):
        classes = super()._get_classes()
        return f'{classes} hide {self.context}-group'

class ToolbarItem(object):
    """
    A Calchart ToolbarItem, in the format

    <li class="toolbar-item {{ class }}" data-name="{{ name }}" data-action="{{ action }}">
        <i class="icon-{{ icon }}"></i>
    </li>

    where the class is the slugified name
    """
    def __init__(self, name, icon, action):
        self.name = name
        # icon class, e.g. "plus" (see css/fonts/icons-reference.html)
        self.icon = icon
        self.action = action

    def render(self):
        return format_html(
            '<li class="toolbar-item {}" data-name="{}" data-action="{}">{}</li>',
            slugify(self.name), self.name, self.action, mark_safe(self._render_contents())
        )

    def _render_contents(self):
        return format_html('<i class="icon-{}"></i>', self.icon)

class ImageToolbarItem(ToolbarItem):
    """
    A Calchart ToolbarItem, in the format

    <li class="toolbar-item {{ class }}" data-name="{{ name }}" data-action="{{ action }}">
        <img src="{% static 'img/' + src %}">
    </li>

    where the class is the slugified name
    """
    def __init__(self, name, src, action):
        super().__init__(name, None, action)
        self.src = src

    def _render_contents(self):
        src = get_static_path(f'img/{self.src}')
        return format_html('<img src="{}">', src)

class CustomToolbarItem(object):
    """
    A Calchart ToolbarItem, with custom HTML contents, in the format

    <li class="toolbar-custom-item {{ class }}">
        {{ contents }}
    </li>

    where the class is the slugified name
    """
    def __init__(self, name, contents):
        self.name = name
        self.contents = contents

    def render(self):
        return format_html(
            '<li class="toolbar-custom-item {}">{}</li>',
            slugify(self.name), mark_safe(self.contents)
        )

class ChoiceToolbarItem(CustomToolbarItem):
    """
    A Calchart ToolbarItem with a select box, in the format

    <li class="toolbar-custom-item {{ class }}">
        <label>{{ name }}:</label>
        <select>
            # for each option
            <option value="{{ value }}">{{ label }}</option>
        </select>
    </li>

    where the class is the slugified name
    """
    def __init__(self, name, options):
        self.name = name
        self.contents = format_html(
            '<label>{}:</label><select>{}</select>',
            name, format_html_join('', '<option value="{}">{}</option>', options)
        )

### MENUS ###

editor_menu = Menu(
    SubMenu('File', [
        MenuContextItem('graph-context', 'New stuntsheet', 'showAddSheet', icon='file-o'),
        MenuItem('Rename show', 'promptRename'),
        MenuItem('Save', 'saveShow', icon='floppy-o'),
        MenuItem('Generate PDF', 'generatePoopsheet', icon='file-pdf-o'),
        MenuItem('Export', 'export', icon='file-code-o'),
    ], [
        MenuItem('Preferences', 'editPreferences'),
        MenuItem('Edit show properties', 'editShowProperties'),
    ]),
    SubMenu('Edit', [
        MenuItem('Undo', 'undo', icon='undo'),
        MenuItem('Redo', 'redo', icon='repeat'),
    ]),
    SubMenu('View', [
        SubMenu('View mode', [
            MenuItem('Music editor', 'loadContext(music)', icon='music'),
            MenuItem('Dot editor', 'loadContext(dot)', icon='dot-circle-o'),
            MenuItem('Continuity editor', 'loadContext(continuity)', icon='pencil-square-o'),
            # MenuItem('3D View', 'loadContext(3d)'),
        ]),
        MenuContextItem('edit-dots', 'Toggle sheet background', 'toggleBackground'),
    ], [
        SubMenuContext('graph-context', 'Zoom', [
            MenuItem('Zoom in', 'zoom(0.1)', icon='search-plus'),
            MenuItem('Zoom out', 'zoom(-0.1)', icon='search-minus'),
        ], [
            MenuItem(label, f'zoomTo({zoom})')
            for zoom, label in ZOOMS
        ], icon='search'),
    ]),
    SubMenu('Help', [
        MenuItem('Go to help...', 'openHelp', icon='question-circle'),
    ]),
)

editor_toolbar = Toolbar(
    ToolbarGroup(
        ToolbarItem('Edit Music', 'music', 'loadContext(music)'),
        ToolbarItem('Edit Dots', 'dot-circle-o', 'loadContext(dot)'),
        ToolbarItem('Edit Continuity', 'pencil-square-o', 'loadContext(continuity)'),
    ),
    ToolbarContextGroup(
        'graph-context',
        ToolbarItem('Add Stuntsheet', 'file-o', 'showAddSheet'),
    ),
    ToolbarContextGroup(
        'edit-dots',
        ToolbarItem('Selection', 'mouse-pointer', 'loadTool(selection)'),
        ToolbarItem('Lasso', 'lasso', 'loadTool(lasso)'),
        ToolbarItem('Swap', 'exchange', 'loadTool(swap)'),
        ToolbarItem('Stretch', 'arrows', 'loadTool(stretch)'),
        ToolbarItem('Line', 'line', 'loadTool(line)'),
        ToolbarItem('Arc', 'arc', 'loadTool(arc)'),
        ToolbarItem('Block', 'rectangle', 'loadTool(block)'),
        ToolbarItem('Circle', 'circle-o', 'loadTool(circle)'),
    ),
    ToolbarContextGroup(
        'edit-dots',
        ChoiceToolbarItem('Snap to', SNAP_OPTIONS),
        CustomToolbarItem('Resnap', '<button>Resnap</button>'),
    ),
    ToolbarContextGroup(
        'edit-continuity',
        ToolbarItem('Previous Beat', 'chevron-left', 'prevBeat'),
        CustomToolbarItem('Seek', '<span class="bar"></span><span class="marker"></span>'),
        ToolbarItem('Next Beat', 'chevron-right', 'nextBeat'),
        ToolbarItem('Check Continuities', 'check', 'checkContinuities(fullCheck=true)'),
    ),
    ToolbarContextGroup(
        'edit-background',
        ToolbarItem('Save', 'check', 'exit'),
        ToolbarItem('Cancel', 'times', 'revert'),
    ),
    ToolbarContextGroup(
        'ftl-path',
        ToolbarItem('Selection', 'mouse-pointer', 'loadTool(selection)'),
        ToolbarItem('Add Point', 'plus-square-o', 'loadTool(add-point)'),
        ToolbarItem('Remove Point', 'minus-square-o', 'loadTool(remove-point)'),
    ),
    ToolbarContextGroup(
        'gate-reference',
        ToolbarItem('Save', 'check', 'exit'),
    ),
    ToolbarContextGroup(
        'edit-music',
        ToolbarItem('Add Song', 'file-o', 'showAddSong'),
    ),
)
