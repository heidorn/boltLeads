# Estudos

Documentos de design deste repositório. São HTML autossuficientes — abrem com
duplo clique, sem servidor e sem internet (fontes embutidas).

| Arquivo | O que cobre |
| --- | --- |
| [`caixa-de-prompt.html`](caixa-de-prompt.html) | A superfície de composição do Studio: 17 achados com o número medido antes e depois, a leitura da referência do Claude Design, e o registro do que foi aplicado nas duas telas |

## Por que ficam versionados

Cada achado aponta o arquivo e a linha onde o defeito estava, e diz o valor
medido no navegador. Quem mexer na caixa de prompt depois vai reencontrar as
mesmas armadilhas — a largura que serve a duas telas opostas, o `outline-none`
que anula o foco da marca, o `useChat` que devolve um array novo a cada render.
O estudo existe para que a segunda pessoa não pague o mesmo pedágio.

Atualize o documento junto com a mudança que ele descreve.
