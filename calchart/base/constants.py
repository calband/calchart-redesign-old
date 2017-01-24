# dot types, see DotType
DOT_TYPES = [
    'plain',
    'solid',
    'plain-forwardslash',
    'solid-forwardslash',
    'plain-backslash',
    'solid-backslash',
    'plain-x',
    'solid-x',
]

# format of dot labels for shows, see CalchartUtils.DOT_FORMATS
DOT_FORMATS = [
    ('', ''),
    ('combo', 'A0, A1, A2, ...'),
    ('number', '1, 2, 3, ...'),
]

# types of fields that can be drawn, see Grapher#_getFieldGrapher
FIELD_TYPES = [
    ('', ''),
    ('college', 'College Field'),
]
DEF_FIELD_TYPES = [
    ('default', 'Default'),
    ('college', 'College Field'),
]

# step types, see CalchartUtils.STEP_TYPES
STEP_TYPES = [
    ('HS', 'High Step'),
    ('MM', 'Mini Military'),
    ('FF', 'Full Field'),
    ('SH', 'Show High'),
    ('JS', 'Jerky Step'),
]
DEF_STEP_TYPES = [
    ('default', 'Default'),
    ('HS', 'High Step'),
    ('MM', 'Mini Military'),
    ('FF', 'Full Field'),
    ('SH', 'Show High'),
    ('JS', 'Jerky Step'),
]

# orientations, see CalchartUtils.ORIENTATIONS
ORIENTATIONS = [
    ('east', 'East'),
    ('west', 'West'),
]
DEF_ORIENTATIONS = [
    ('default', 'Default'),
    ('east', 'East'),
    ('west', 'West'),
]

# zoom options
ZOOMS = [
    (0.5, '50%'),
    (0.75, '75%'),
    (1, '100%'),
    (1.5, '150%'),
    (2, '200%'),
]
