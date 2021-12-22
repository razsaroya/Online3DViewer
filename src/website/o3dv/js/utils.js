import domUtils from '../../../viewer/domutils.js';

export class Utils {
    
    GetNameOrDefault(originalName, defaultName) {
        if (originalName.length > 0) {
            return originalName;
        }
        return defaultName;
    };

    GetNodeName(originalName) {
        return this.GetNameOrDefault(originalName, 'No Name');
    };

    GetMeshName(originalName) {
        return this.GetNameOrDefault(originalName, 'No Name');
    };
    
    GetMaterialName(originalName) {
        return this.GetNameOrDefault(originalName, 'No Name');
    };
    
    IsHoverEnabled() {
        return window.matchMedia('(hover: hover)').matches;
    };

    AddSmallWidthChangeEventListener(onChange) {
        let mediaQuery = window.matchMedia('(max-width: 800px)');
        mediaQuery.addEventListener('change', onChange);
    };
    
    IsSmallWidth() {
        return window.matchMedia('(max-width: 800px)').matches;
    };
    
    IsSmallHeight() {
        return window.matchMedia('(max-height: 800px)').matches;
    };

    InstallTooltip(element, text) {
        function CalculateOffset(element, tooltip) {
            let windowWidth = window.innerWidth;

            let elementOffset = element.getBoundingClientRect();
            let elementWidth = element.offsetWidth;
            let elementHeight = element.offsetHeight;
            let tooltipWidth = tooltip.offsetWidth;

            let tooltipMargin = 10;
            let left = elementOffset.left + elementWidth / 2 - tooltipWidth / 2;
            if (left + tooltipWidth > windowWidth - tooltipMargin) {
                left = windowWidth - tooltipWidth - tooltipMargin;
            }
            if (left < tooltipMargin) {
                left = tooltipMargin;
            }
            left = Math.max(left, 0);
            return {
                left: left,
                top: elementOffset.top + elementHeight + tooltipMargin
            };
        }

        if (!this.IsHoverEnabled()) {
            return;
        }

        let tooltip = null;
        element.addEventListener('mouseover', () => {
            tooltip = domUtils.AddDiv(document.body, 'ov_tooltip', text);
            let offset = CalculateOffset(element, tooltip);
            tooltip.style.left = offset.left + 'px';
            tooltip.style.top = offset.top + 'px';
        });
        element.addEventListener('mouseout', () => {
            tooltip.remove();
        });
    };

    CopyToClipboard(text) {
        let input = document.createElement('input');
        input.style.position = 'absolute';
        input.style.left = '0';
        input.style.top = '0';
        input.setAttribute('value', text);
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
    };
    
    DownloadUrlAsFile(url, fileName) {
        let link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    DownloadArrayBufferAsFile(arrayBuffer, fileName) {
        let url = CreateObjectUrl(arrayBuffer);
        this.DownloadUrlAsFile(url, fileName);
    };
    
    CreateSvgIconElement(iconName, className) {
        let iconDiv = domUtils.CreateDiv('ov_svg_icon');
        if (className) {
            iconDiv.classList.add(className);
        }
        domUtils.AddDomElement(iconDiv, 'i', 'icon icon-' + iconName);
        return iconDiv;
    };

    AddSvgIconElement(parentElement, iconName, className) {
        let iconDiv = this.CreateSvgIconElement(iconName, className);
        parentElement.appendChild(iconDiv);
        return iconDiv;
    };

    SetSvgIconImageElement(iconElement, iconName) {
        let iconDiv = iconElement.firstChild;
        iconDiv.className = 'icon icon-' + iconName;
    };
    
    CreateHeaderButton(parentElement, iconName, title, link) {
        let buttonLink = domUtils.CreateDomElement('a');
        buttonLink.setAttribute('href', link);
        buttonLink.setAttribute('target', '_blank');
        buttonLink.setAttribute('rel', 'noopener noreferrer');
        this.InstallTooltip(buttonLink, title);
        this.AddSvgIconElement(buttonLink, iconName, 'header_button');
        parentElement.appendChild(buttonLink);
        return buttonLink;
    };

    CreateInlineColorCircle(color) {
        let hexString = '#' + this.ColorToHexString(color);
        let darkerColor = new this.Color(
          Math.max(0, color.r - 50),
          Math.max(0, color.g - 50),
          Math.max(0, color.b - 50)
        );
        let darkerColorHexString = '#' + this.ColorToHexString(darkerColor);
        let circleDiv = domUtils.CreateDiv('ov_color_circle');
        circleDiv.style.background = hexString;
        circleDiv.style.border = '1px solid ' + darkerColorHexString;
        return circleDiv;
    };
    
    InstallVerticalSplitter(splitterDiv, resizedDiv, flipped, onResize) {
        let originalWidth = null;
        this.CreateVerticalSplitter(splitterDiv, {
            onSplitStart: () => {
                originalWidth = this.GetDomElementOuterWidth(resizedDiv);
            },
            onSplit: (xDiff) => {
                const minWidth = 280;
                const maxWidth = 450;
                let newWidth = 0;
                if (flipped) {
                    newWidth = originalWidth - xDiff;
                } else {
                    newWidth = originalWidth + xDiff;
                }
                if (newWidth < minWidth) {
                    newWidth = minWidth;
                } else if (newWidth > maxWidth) {
                    newWidth = maxWidth;
                }
                domUtils.SetDomElementOuterWidth(resizedDiv, newWidth);
                onResize();
            }
        });
    };
}