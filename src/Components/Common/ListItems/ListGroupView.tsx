import * as React from 'react';

import { PanelView } from './PanelView';
import { ItemsPresenter } from '../Items/ItemsPresenter';
import { ListItemsViewTemplate, ListItemsViewTemplateProps } from './ListItemsViewTemplate';
import { ListGroupPanel } from '../Panel/ListGroupPanel';
import { PanelFragment, PanelItemContext } from '../Panel/Panel';
import { ListItemsViewModel } from './ListItemsViewModel';

export interface ListGroupViewProps extends ListItemsViewTemplateProps {
  fill?: boolean;
}

export interface ListGroupViewComponentProps extends React.HTMLProps<any>, ListGroupViewProps {
}

export class ListGroupView extends ListItemsViewTemplate<ListGroupViewComponentProps> {
  public static getSelectedProps(isSelected: boolean) {
    return {
      active: isSelected,
    };
  }

  render() {
    const { className, children, props, rest } = this.restProps(x => {
      const { fill, listItems, itemsProps } = x;
      return { fill, listItems, itemsProps };
    });

    return (
      <PanelView
        className={ className }
        itemsPanelTemplate={ this.renderListItemPanel.bind(this) }
        selectedProps={ ListGroupView.getSelectedProps }
        listItems={ props.listItems }
        itemsProps={ props.itemsProps }
        { ...React.Component.trimProps(rest) }
      >
        { children }
      </PanelView>
    );
  }

  protected renderListItemPanel(itemTemplates: Array<React.ReactNode>, itemsPresenter: ItemsPresenter, items: Array<{}> | undefined) {
    return (
      <ListGroupPanel fill={ this.props.fill }>
        { itemTemplates }
      </ListGroupPanel>
    );
  }
}
