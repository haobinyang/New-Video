export class Element {
  constructor(config, player) {
    Object.assign(this, config);
    this.player = player;
    this.isAttachToPainter = false;
    this.sprite = null;
    this.isStart = false;
  }

  updateZIndex(zIndex) {
    this.zIndex = zIndex;
  }

  onCurrentTimeChange(isManual) {
  }

  pause() {
  }

  addToPainter() {
    if (!this.isAttachToPainter) {
      this.isAttachToPainter = true;
      this.player.painter.add(this.sprite, this.id);
    }
  }

  removeFromPainter() {
    if (this.isAttachToPainter) {
      this.isAttachToPainter = false;
      this.player.painter.remove(this.id);
    }
  }
}