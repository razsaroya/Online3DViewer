export default class DomUtils{

    GetIntegerFromStyle(parameter)
    {
        return Math.round (parseFloat (parameter));
    };

    GetDomElementExternalWidth(style)
    {
        let padding = this.GetIntegerFromStyle (style.paddingLeft) + this.GetIntegerFromStyle (style.paddingRight);
        let border = this.GetIntegerFromStyle (style.borderLeftWidth) + this.GetIntegerFromStyle (style.borderRightWidth);
        let margin = this.GetIntegerFromStyle (style.marginLeft) + this.GetIntegerFromStyle (style.marginRight);
        return padding + border + margin;
    };

    GetDomElementExternalHeight(style)
    {
        let padding = this.GetIntegerFromStyle (style.paddingTop) + this.GetIntegerFromStyle (style.paddingBottom);
        let border = this.GetIntegerFromStyle (style.borderTopWidth) + this.GetIntegerFromStyle (style.borderBottomWidth);
        let margin = this.GetIntegerFromStyle (style.marginTop) + this.GetIntegerFromStyle (style.marginBottom);
        return padding + border + margin;
    };

    GetDomElementInnerDimensions(element, outerWidth, outerHeight)
    {
        let style = getComputedStyle (element);
        let width = outerWidth - this.GetDomElementExternalWidth (style);
        let height = outerHeight - this.GetDomElementExternalHeight (style);
        return {
            width : width,
            height : height
        };
    };

    CreateDomElement(elementType, className, innerHTML)
    {
        let element = document.createElement (elementType);
        if (className) {
            element.className = className;
        }
        if (innerHTML) {
            element.innerHTML = innerHTML;
        }
        return element;
    };

    AddDomElement(parentElement, elementType, className, innerHTML)
    {
        let element = this.CreateDomElement (elementType, className, innerHTML);
        parentElement.appendChild (element);
        return element;
    };

    ClearDomElement(element)
    {
        while (element.firstChild) {
            element.removeChild (element.firstChild);
        }
    };

    InsertDomElementBefore(newElement, existingElement)
    {
        existingElement.parentNode.insertBefore (newElement, existingElement);
    };

    InsertDomElementAfter(newElement, existingElement)
    {
        existingElement.parentNode.insertBefore (newElement, existingElement.nextSibling);
    };

    ShowDomElement(element)
    {
        element.style.display = 'block';
    };

    HideDomElement(element)
    {
        element.style.display = 'none';
    };

    IsDomElementVisible(element)
    {
        return element.offsetParent !== null;
    };

    SetDomElementWidth(element, width)
    {
        element.style.width = width.toString () + 'px';
    };

    SetDomElementHeight(element, height)
    {
        element.style.height = height.toString () + 'px';
    };

    GetDomElementOuterWidth(element)
    {
        let style = getComputedStyle (element);
        return element.offsetWidth + this.GetIntegerFromStyle (style.marginLeft) + this.GetIntegerFromStyle (style.marginRight);
    };

    GetDomElementOuterHeight(element)
    {
        let style = getComputedStyle (element);
        return element.offsetHeight + this.GetIntegerFromStyle (style.marginTop) + this.GetIntegerFromStyle (style.marginBottom);
    };

    SetDomElementOuterWidth(element, width)
    {
        let style = getComputedStyle (element);
        this.SetDomElementWidth (element, width - this.GetDomElementExternalWidth (style));
    };

    SetDomElementOuterHeight(element, height)
    {
        let style = getComputedStyle (element);
        this.SetDomElementHeight (element, height - this.GetDomElementExternalHeight (style));
    };

    CreateDiv(className, innerHTML)
    {
        return this.CreateDomElement ('div', className, innerHTML);
    };

    AddDiv(parentElement, className, innerHTML)
    {
        return this.AddDomElement (parentElement, 'div', className, innerHTML);
    };
}
