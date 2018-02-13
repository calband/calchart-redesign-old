# SVG Font

This directory contains SVG files that will make up the `calchart-icons`
font. To update the font, add/edit/remove any SVG file in this directory
and run `npm run build:svg`. This will regenerate the font files and
`calchart-icons.css`.

To use in HTML, create an element `<i data-icon="name-of-icon"></i>`,
where `data-icon` is set to the name of the SVG file in this directory.
