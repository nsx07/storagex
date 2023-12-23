import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { FileNode } from "../app.component";

export type Swap = {
    drag: FileNode | null,
    drop: FileNode | null
}

@Injectable({
    providedIn: 'root'
})
export class DragService {

    private doSwap : Subject<Swap> = new Subject();

    private _swap : Swap = {
        drag: null,
        drop: null
    } 

    public swap(): Observable<Swap> {
        return this.doSwap.asObservable();
    }

    public startDrag(data: FileNode) {
        this._swap.drag = data;
    }

    public endDrag(data: FileNode) {
        if (this._swap.drop == null || this._swap.drag!.uid == this._swap.drop.uid || this._swap.drop.content?.find(x => x.uid == this._swap.drag!.uid)) {
            return;
        }

        this.doSwap.next(this._swap);
    }

    public setSwapData(data: FileNode) {
        this._swap.drop = data;
    }


}