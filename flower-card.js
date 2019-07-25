import {
    FlowerData
} from '/local/custom/lovelace-flower-card/data/data.js';

customElements.whenDefined('card-tools').then(() => {
    class FlowerCard extends cardTools.LitElement {
        async setConfig(config) {
            this.config = config;
        }

        static get styles() {
            return cardTools.LitCSS `
        .attributes {
            display: grid;
            grid-template-columns: 1fr 10px 1fr;
            grid-template-rows: 1fr;
            padding: 16px 0px 0px;
            transform: translateX(-5px);
        }
        .attributes .type {
            display: inline-block;
            width: 100%;
            white-space: normal;
        }
        .attributes .type:nth-child(1) {
            grid-column: 1;
            grid-row: 1;
        }
        .attributes .type:nth-child(2) {
            grid-column: 3;
            grid-row: 1;
        }
        .attribute {
            display: grid;
            grid-template-columns: 22px 10% auto 10%;
            grid-gap: 5px;
            align-items: center;
        }
        /* icons */
        .attribute ha-icon {
            width: 24px;
            height: 24px;
        }
        .brightness ha-icon,
        .conductivity ha-icon {
            width: 20px;
            margin-right: 8px
        }
        .temperature ha-icon {
            width: 22px;
            margin-right: 6px
        }
        /* tooltip */
        .bar[aria-label] {
            position: relative;
        }
        .bar[aria-label]:after {
            position: absolute;
            display: none;
            top: 100%;
            animation: showTooltip 0.2s;
            z-index: 100;
        }
        .bar[aria-label]:after {
            content: attr(aria-label);
            left: 50%;
            top: -5px;
            font-size: 11px;
            transform: translate(-50%, -100%);
            white-space: nowrap;
            background: var(--primary-background-color);
            padding: 3px 6px;
            border-radius: 5px;
        }
        .bar[aria-label]:hover:after {
            display: block;
        }
        @keyframes showTooltip {
            from {
                opacity: 0;
            }
        }
        /* header */
        .header {
            display: grid;
            grid-template-columns: auto 1fr;
            grid-template-rows: auto auto;
            align-items: center;
            padding-bottom: 8px;
        }
        .header > #name {
            width: 100%;
            text-transform: capitalize;
            display: block;
            grid-column: 2;
            grid-row: 1;
            align-self: flex-end;
            padding-left: 8px;
            color: var(--primary-text-color);
        }
        .header > #species {
            text-transform: capitalize;
            color: var(--secondary-text-color);
            display: block;
            grid-column: 2;
            grid-row: 2;
            align-self: flex-start;
            padding-left: 8px;
        }
        .header > #image {
            grid-column: 1;
            grid-row: 1 / span 2;
            display: inline-block;
            background-size: cover;
            height: 40px;
            width: 40px;
            min-width: 40px;
            line-height: 40px;
            margin-right: 8px;
            position: relative;
            text-align: center;
            will-change: border-color;
            animation: 0.25s ease-out 0s 1 normal none running fade-in;
            background-position: center center;
            background-repeat: no-repeat;
            border-radius: 100%;
            transition: border-color 0.25s ease-out 0s;
        }
        .meter {
            height: 6px;
            background-color: var(--paper-plant-container-color);
            display: inline-grid;
            border-radius: 2px;
        }
        .meter > span {
            background-color: var(--paper-plant-inner-color);
            grid-row: 1;
            grid-column: 1;
            height: 100%;
            border-radius: 2px;
        }
        `;
    }

    render() {
        const species = this.config.species;
        const Flower = FlowerData[species];
        const img_nospaces = species.replace(/\s/g, '_');
        const img = img_nospaces.replace(/'/g, '');
        if (!this.stateObj)
            return cardTools.LitHtml ``;

        const attribute = (icon, val, unit, min, max) => {
            const pct = 100 * Math.max(0, Math.min(1, (val - min) / (max - min)));
            return cardTools.LitHtml `
            <div class="attribute">
            <ha-icon .icon="${icon}"></ha-icon>
            <div class="meter red">
                <span
                class="bar ${val < min || val > max ? 'bad' : 'good'}"
                style="width: 100%;" aria-label="${val < min || val > min ? val + unit : ''}"
                ></span>
            </div>
            <div class="meter green">
                <span
                class="bar ${val > max ? 'bad' : 'good'}"
                style="width:${pct}%;" aria-label="${val < min || val > min ? val + unit : ''}"
                ></span>
            </div>
            <div class="meter red">
                <span
                class="bar bad"
                style="width:${val > max ? 100 : 0}%;" aria-label="${val < min || val > min ? val + unit : ''}"
                ></span>
            </div>
            </div>
        `;
        // ${val} (${min}-${max})
        }

        return cardTools.LitHtml `
        <ha-card>
        <div class="header"
        @click="${() => cardTools.moreInfo(this.stateObj.entity_id)}"
        >
        <span id="image" style="background-image: url(/local/custom/lovelace-flower-card/data/images/${img}.jpg)"></span>
        <span id="name">${this.stateObj.attributes.friendly_name}</span>
        <span id="species"> ${Flower[0]} </span>
        </div>
        <div class="attributes">
        <div class="type temperature">${attribute('mdi:thermometer', this.stateObj.attributes.temperature, ' °C', Flower[4], Flower[5])}</div>
        <div class="type brightness">${attribute('mdi:white-balance-sunny', this.stateObj.attributes.brightness, ' lx', Flower[2], Flower[3])}</div>
        </div>
        <div class="attributes">
        <div class="type moisture">${attribute('mdi:water-percent', this.stateObj.attributes.moisture, ' %', Flower[6], Flower[7])}</div>
        <div class="type conductivity">${attribute('mdi:leaf', this.stateObj.attributes.conductivity, ' µS/cm', Flower[8], Flower[9])}</div>
        </div>

        </ha-card>
        `;
    }

    set hass(hass) {
        this._hass = hass;
        this.stateObj = hass.states[this.config.entity];
        this.requestUpdate();
    }

    }

    customElements.define('flower-card', FlowerCard);
});

window.setTimeout(() => {
    if (customElements.get('card-tools')) return;
    customElements.define('flower-card', class extends HTMLElement {
        setConfig() {
            throw new Error("Can't find card-tools. See https://github.com/thomasloven/lovelace-card-tools");
        }
    });
}, 2000);