/**
 * A funktion to get the corner coordinates of a measure template
 *
 * @param {MeasureTemplateDocument} document
 * @returns {[{x:number, y:number}, {x:number, y:number}]}
 */
export function GetMeasureTemplateCornerCoordinates(document) {
    switch (document.t) {
        case "circle":
            return GetCircleCorners(document);
        case "rect":
            return GetRectCorners(document);
        case "cone":
        case "ray":
            return GetPolygonCorners(document);
        default:
            return [
                { x: document.x, y: document.y, },
                { x: document.x, y: document.y, }
            ];
    }
}
function GetCircleCorners(document) {
    const radius = document._object.shape.radius;
    return [
        { x: document.x - radius, y: document.y - radius },
        { x: document.x + radius, y: document.y + radius }
    ];
}
function GetRectCorners(document) {
    const shape = document._object.shape;
    return [
        {
            x: document.x + shape.x,
            y: document.y + shape.y,
        },
        {
            x: document.x + shape.x + shape.width,
            y: document.y + shape.y + shape.height,
        }
    ];
}
function GetPolygonCorners(document) {
    const points = document._object.shape.points;
    const xCoordinates = [];
    const yCoordinates = [];

    for (let index = 0; index < points.length; index += 2) {
        xCoordinates.push(document.x + points[index]);
        yCoordinates.push(document.y + points[index + 1]);
    }

    return [
        { x: Math.min(...xCoordinates), y: Math.min(...yCoordinates) },
        { x: Math.max(...xCoordinates), y: Math.max(...yCoordinates) }
    ];
}