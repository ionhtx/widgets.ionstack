# Zenotica Coming Soon Page

_Started 2026-10-07 17:20 UTC_

---

## User

we're redesigning this site https://zenotica.com/ and I need a Coming Soon landing page for the new site. Using the branding colors but leaning more on the feng shui kind of aesthetic.

## Assistant

_[tool: list_files]_

_[tool: web_fetch]_

_[tool: dc_write]_

_[tool: ready_for_verification]_

_[tool: web_fetch]_

I built the Coming Soon page in `Coming Soon.dc.html`. It has "Coming Soon" set inside a slowly breathing circle-and-octagon (bagua) outline. Below that are an email signup and the five elements (Wood, Fire, Earth, Metal, Water) in a quiet footer row.

- **Colors:** I couldn't read the zenotica.com brand colors from the page text, so I used the attached design system's gold on warm off-white. If you send the brand hex values, I'll swap them in.
- **Signup:** the form points to the existing Zenotica newsletter link (eepurl.com/c-yhkD). It doesn't capture emails itself.
- **Copy:** the line "Dynamic visual brands and harmonious spaces," the services line and the Katy, Houston footer come from the current site. The rest I wrote, so check it. I haven't added the logo or any photography yet.

## User

Send this design to Canva: `Coming Soon.dc.html`

## Assistant

_[tool: tool_search_tool_bm25]_

I couldn't send the page to Canva. The Canva design-import tool isn't available here, so I didn't bundle anything. The upload tools I did find can't create an editable Canva design.

To fix it, connect Canva in the Connectors panel and ask me again. Once Canva is connected, switching back to this tab should pick it up.

In the meantime, I can package `Coming Soon.dc.html` as a single offline HTML file for you to download. Want that?

## User

it actually is available in connectors

## Assistant

_[tool: bundle_project]_

_[tool: tool_search_tool_bm25]_

_[tool: dc_html_str_replace]_

_[tool: bundle_project]_

_[tool: canva__import-design-from-url]_

The Coming Soon page is now in Canva as a one-page design: [Open in Canva](https://www.canva.com/d/M-sTNpEGI-CtWrz)

I haven't opened it in Canva, so check that the fonts and the circle outline came through as editable.

## User

I like the graphics in the center

## Assistant

Glad the centerpiece works. The circle-and-octagon graphic is unchanged in `Coming Soon.dc.html`, and so is the rest of the page. What would you like to do with it? A few options:

- Make it larger or give it more of the page.
- Add a yin-yang or bagua trigrams at the eight points.
- Reuse it as a favicon or a mark for the other pages on the new site.

## User

I like the bagua idea. I would like it to have a soft circular motion around the center text as well.

## User

Found issues — fixing…

## User

Found issues — fixing…

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I moved the trigram ring outward, into the band between the inner circle and the octagon. The trigrams should no longer touch the center text. I haven't checked how it looks in the preview, and the verifier is still reviewing it.

The Canva copy still has the earlier version. Say the word and I'll re-send it.

## User

can you make it a little more airy. It all too tight. Agree?

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

Yes, it was tight. I made these changes to `Coming Soon.dc.html`:

- **Graphic:** it's about a third larger, so the trigram ring has more room around the text.
- **Center text:** "Coming Soon" is now two smaller lines, "Coming" over "Soon", and sits inside the inner circle.
- **Kicker:** "A new space is opening" moved above the graphic.
- **Spacing:** I added more space between the graphic, the paragraph, the divider and the signup, and more space above and below the section.

I haven't checked how it looks in the preview, and the verifier is still reviewing it.

## User

undo that. I meant only the part with the motion.

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I put the layout and text back as they were and changed only the graphic.

- **Trigrams:** they're smaller and thinner, with more space between them and the rings.
- **Octagons:** I removed the inner octagon, so there are fewer lines crowding the motion.

I haven't checked the result in the preview, and the verifier is still reviewing it.

## User

these kind of elements and the lines behind are overlapping

## User

Found issues — fixing…

## User

Found issues — fixing…

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I removed the octagon and the innermost circle, so no lines run behind the center text now. The text also got smaller: "Coming" over "Soon" in two lines, with a tighter kicker above. The trigram ring and the orbiting dot are unchanged.

I haven't checked the result in the preview, and the verifier is still reviewing it.

## User

I liked the octagon

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

The octagon is back, now as the outermost layer, and it doesn't cross the trigrams or the center text. I added the second thinner octagon too, and both turn slowly. The graphic is a bit larger overall so the inner circle keeps its size.

I haven't checked the preview, and the verifier is still reviewing it.

## User

perfect. lets update the Canva page content. you can use it.

## Assistant

_[tool: bundle_project]_

_[tool: canva__import-design-from-url]_

The updated page is in Canva as a new design, "Zenotica Coming Soon redesign v2": [Open in Canva](https://www.canva.com/d/1No-KTlFHSXzRpz)

I couldn't edit the first Canva design in place, so that earlier version still exists separately. I haven't opened the new one, so check that the rotating graphic came through as editable.

## User

I would like all this center section to be embedable like some sort of widget to use in a simvoly WL site.

## Assistant

_[tool: read_file]_

_[tool: grep]_

_[tool: write_file]_

_[tool: show_to_user]_

I made the center section into a standalone widget: `zenotica-coming-soon-widget.html`. It has the animated bagua graphic, the text, and the signup. Paste its full contents into a Simvoly custom code or HTML embed block.

- **Self-contained:** the styles are prefixed `zn-cs`, so they won't clash with your Simvoly theme. It loads Cormorant Garamond and Lora from Google Fonts.
- **Layout:** it sizes to whatever container it's placed in, up to 640px wide. The background is transparent, so it takes the section's background in Simvoly.
- **Motion:** the animation is switched off for visitors who have reduced motion turned on in their device settings.
- **Signup:** it still posts to the Zenotica newsletter link (eepurl.com/c-yhkD).

I opened the file but haven't checked it in a Simvoly page. Check that the rotating rings stay centered in the Simvoly preview.

## User

wheres the code?

## Assistant

The code is in `zenotica-coming-soon-widget.html` in the project files. It's the file open in your tab bar now. Select all and copy the whole file, then paste it into a Simvoly custom code/HTML block.

I can also print it here in chat if you'd rather copy it from there.

## User

there's nothing open in any tab

## Assistant

_[tool: show_to_user]_

_[tool: present_fs_item_for_download]_

I reopened `zenotica-coming-soon-widget.html` in your tab bar and added a download card above. Open the downloaded file in a text editor, copy everything, and paste it into a Simvoly custom code/HTML block.

## User

the rotating elements are off center.

## Assistant

_[tool: run_script]_

_[tool: show_to_user]_

I fixed the off-center rotation in `zenotica-coming-soon-widget.html` and in `Coming Soon.dc.html`. The rotation point was offset because of the graphic's extended view box. Download the widget file again before pasting it into Simvoly. I haven't confirmed the rings now turn around the center in the preview.

## User

that made it worse

## Assistant

_[tool: run_script]_

_[tool: show_to_user]_

I changed how the rings and trigrams rotate in `zenotica-coming-soon-widget.html` and in `Coming Soon.dc.html`. The rotation is now defined inside the graphic itself, around its exact center, rather than in the page's styles. That should keep it centered in Simvoly, whatever the page styles do. I haven't confirmed it by eye in the preview.

Download the widget file again before pasting it into Simvoly, because the earlier download has the old rotation.

## User

thanks you

## Assistant

You're welcome. If the rotation is still off in Simvoly, tell me and I'll adjust it.

## User

give me the htlm now that's fixed

## Assistant

_[tool: present_fs_item_for_download]_

The fixed widget is in the download card above. It's `zenotica-coming-soon-widget.html`, which has the corrected rotation. Open it in a text editor, copy everything, and paste it into your Simvoly HTML block.

