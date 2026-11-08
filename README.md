<p align="center"><img src="https://raw.githubusercontent.com/ManuelOsmaDev/tangerine-ui/main/sitio/logo.svg" width="80" alt="Logo de Tangerine"></p>

# Tangerine UI

Componentes para [Tangerine](https://github.com/ManuelOsmaDev/tangerine-lang): botones, formularios, modales, tablas y avisos. Son accesibles, tienen modo oscuro y un tema que cambias con una variable. Además, su CSS funciona en cualquier HTML, incluidos Angular, React y Vue.

**Documentación con ejemplos editables en vivo:** https://manuelosmadev.github.io/tangerine-ui/

En npm se llama **`tangerine-lang-ui`**.

```swift
import { Card, Input, Switch, Button, toast, Toaster } from "tangerine-lang-ui"

struct Perfil {
  @State var nombre = ""
  @State var avisos = true

  view {
    Card("Tu perfil", "Así te verán los demás") {
      Input("Nombre", $nombre).placeholder("Ana Pérez")
      Switch("Recibir avisos", $avisos)
      Button("Guardar", || toast("Guardado", "success")).disabled(nombre == "")
    }
    Toaster()
  }
}

mount("#app", Perfil)
```

## Instalar

En un proyecto de Tangerine (5.2 o más reciente):

```bash
tangerine add tangerine-lang-ui
```

Agrega el CSS a `styles` en `tangerine.json`:

```json
{ "styles": ["node_modules/tangerine-lang-ui/css/tangerine-ui.css", "src/estilos.css"] }
```

**Sin Tangerine**, en cualquier HTML, enlaza solo el CSS y usa las clases:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tangerine-lang-ui/css/tangerine-ui.css">
<button class="t-btn t-btn-primary">Guardar</button>
```

## Componentes

| Grupo | Componentes |
| --- | --- |
| Formularios | `Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `RadioGroup` |
| Contenedores | `Card`, `Modal`, `Tabs` |
| Feedback | `Alert`, `toast` + `Toaster`, `Progress`, `Spinner`, `Skeleton` |
| Datos | `Table`, `Badge`, `Avatar`, `Kbd` |
| Layout | `Stack`, `Row`, `Grid`, `Divider` |

Se escriben como en SwiftUI:
- Los argumentos van entre paréntesis.
- Las variantes se escriben con punto: `.danger`.
- El contenido va en un bloque `{ }`.
- Los ajustes se encadenan: `.size("sm").disabled()`.
- Los campos se unen a tu estado con `$campo`.

## Temas

Todo sale de variables CSS. Ponlas después de `tangerine-ui.css`:

```css
:root {
  --t-accent: #3e63dd;
  --t-radius: 12px;
}
```

El modo oscuro sigue al sistema. Para forzarlo, pon `<html data-theme="dark">` (o `"light"`).

## Desarrollo

La web está hecha con Tangerine y con estos mismos componentes, en `sitio/`.

```bash
npm run sitio      # construye sitio/dist
npm run serve      # la sirve en http://localhost:4322
```

`npm run sitio` busca el CLI de Tangerine en `TANGERINE_LANG`, en `node_modules` o en la carpeta vecina `../tangerine-lang`.

## Licencia

MIT
