# Self-hosted display and body faces

Both are the Google Fonts **latin** subset (Basic Latin, Latin-1 Supplement and
common punctuation), instanced with `fontTools.varLib.instancer` to the weight
range the site actually renders — found by walking every page at 1440px and
390px and recording each text node's computed weight:

| File | Family | Axis kept | Original |
| --- | --- | --- | --- |
| `cormorant-garamond-latin-wght400-500.woff2` | Cormorant Garamond | wght 400–500 | 300–700 |
| `inter-latin-wght400-600.woff2` | Inter | wght 400–600 | 100–900 |

Outlines inside the kept range are unchanged. Both families are licensed under
the SIL Open Font License 1.1 (see `OFL.txt`). Italics and IBM Plex Mono are
still served by `next/font/google` (static weight 400, not preloaded).

Regenerate after changing the type scale:

```bash
python -c "from fontTools.ttLib import TTFont; from fontTools.varLib import instancer; f=TTFont('in.woff2'); g=instancer.instantiateVariableFont(f, {'wght': (400, 600)}, updateFontNames=False); g.flavor='woff2'; g.save('out.woff2')"
```
