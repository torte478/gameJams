export default class Helper {

    static updateShadow(shadow, downY, curY, upY, startFrame, endFrame, offset) {
        const dist = downY - curY;
        const totalDistance = downY - upY;

        const unit = totalDistance / (endFrame - startFrame);
        const frame = startFrame + Math.floor((totalDistance - dist) / unit);

        shadow
            .setFrame(frame)
            .setPosition(
                0,
                dist + offset);
    }
}