import { Component } from "@angular/core";

@Component({
    selector: 'context-menu',
    template: `
        <ng-content></ng-content>
    `,
    standalone: true,
})
export class ContextMenuComponent {

    constructor() {
        console.log("ContextMenuComponent");
    }

}