import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import './assets/style.css';

export interface IListItem {
  Title: string;
  IconLink: string;
  IconImage: string;
  Href: String;
}

export default class CafeWebPart extends BaseClientSideWebPart<any> {
  private renderDataContainerId: string = 'cafeDataContainer';

  public render(): void {
    this.domElement.innerHTML = `
      <h1 class="cafe-heading-menu">Today Menu</h1>
      <div id="${this.renderDataContainerId}"></div>
          <div class="cafaSeemore">
        <a href="https://ogdclcloud.sharepoint.com/SitePages/CafeteriaPage.aspx" target="_blank" class="cafaLinkseemore">
          <span class="cafaSeemoretext ">See More ></span>
        </a>
      </div>
    `;
    this._renderData();
  }

  private async _renderData(): Promise<void> {
    try {
      const listItems: IListItem[] = await this._getListItems('MenuList');
      const dataElement: HTMLElement | null = this.domElement.querySelector(`#${this.renderDataContainerId}`);
      if (dataElement !== null) {
        dataElement.innerHTML = this._renderItems(listItems);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      const dataElement: HTMLElement | null = this.domElement.querySelector(`#${this.renderDataContainerId}`);
      if (dataElement !== null) {
        dataElement.innerHTML = `<div>Error fetching data. Please try again later.</div>`;
      }
    }
  }

  private async _getListItems(listTitle: string): Promise<IListItem[]> {
    console.log("Entering _getListItems method");
    const endpoint = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${listTitle}')/items?$select=Title,IconImage,Href`;
    console.log("API endpoint:", endpoint);

    try {
      const response: SPHttpClientResponse = await this.context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1);
      console.log("API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("API data received:", data);
        return data.value;
      } else {
        const errorText = await response.text();
        console.error(`Error fetching list items: ${response.statusText}`, errorText);
        throw new Error(`Error fetching list items: ${response.statusText}`);
      }
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private _renderItems(items: IListItem[]): string {
    let htmlWithImages = '<div class="cafe-grid-container">';
    let htmlWithoutImages = '<div class="cafe-grid-container cafe-no-icon">';

    items.forEach((item) => {
      if (item.IconImage) {
        htmlWithImages += `
                  <a class="LinkURL" href="${item.Href}" target="_blank">
          <div class="cafe-grid-item">
            <img class="cafe-bg-image-icon" src="${item.IconImage}" alt="${item.Title}" />
            <span class="cafe-md-title">${item.Title}</span>
           
          </div>  </a>`;
      } else {
        htmlWithoutImages += `
        <a class="LinkURL" href="${item.Href}" target="_blank">
          <div class="cafe-grid-items">
            <span class="cafe-md-title">${item.Title}</span>
          </div>
          </a>
       
          `;
      }

    });

    htmlWithImages += '</div>';
    htmlWithoutImages += '</div>';

    return htmlWithImages + htmlWithoutImages;
  }
}
