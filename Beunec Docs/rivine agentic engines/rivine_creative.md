# Rivine Creative  

Rivine Creative generates visual and media deliverables: images, short video, and the supporting assets a marketing or product surface needs. Structurally, it follows the same conditional-composition pattern as the other engines: a coordinating layer routes a creative brief to the right generation capability for the requested medium, rather than treating "generate media" as a single undifferentiated capability. What's specific to Creative is that its outputs are evaluated on a different axis than the other engines - visual and stylistic quality rather than factual grounding, so its validation and refinement loop is built around iterative visual review rather than citation-checking. We are intentionally not detailing the internal generation pipeline, providers, or role roster further in this publication.

```mermaid
flowchart LR
    Brief([Creative brief]) --> Coord[Coordinating layer]
    Coord --> Medium{Requested medium}
    Medium -->|Still| Img[Image generation path]
    Medium -->|Motion| Vid[Video / motion path]
    Medium -->|Support assets| Ast[Supporting asset path]
    Img --> Rev[Visual / stylistic review]
    Vid --> Rev
    Ast --> Rev
    Rev -->|Needs another pass| Coord
    Rev -->|Acceptable| Out([Media deliverable])
```



*Figure - Creative routes by medium, then reviews on visual criteria. Provider names, model IDs, and prompt text are omitted on purpose.*

```mermaid
flowchart TD
    subgraph Compared["What good means, by engine"]
        Chat[Chat / Research: factual grounding]
        Legal[Cicero: legal completeness + honesty about gaps]
        Code[Code: runnable correctness + contracts]
        Creative[Creative: visual / stylistic quality]
    end
    Creative --> Loop[Iterative visual refine]
    Chat --> Cite[Citation / source discipline]
    Code --> Run[Preview and validate]
```
 