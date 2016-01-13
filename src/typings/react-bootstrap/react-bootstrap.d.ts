// Type definitions for react-bootstrap
// Project: https://github.com/react-bootstrap/react-bootstrap
// Definitions by: Walker Burgin <https://github.com/walkerburgin>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

///<reference path="../react/react.d.ts"/>

declare module "react-bootstrap" {
    // Import React
    import React = require("react");


    // <Button />
    // ----------------------------------------
    interface ButtonProps extends React.HTMLProps<ButtonClass>{

        // Optional
        active?: boolean;
        disabled?: boolean;
        block?: boolean;
        bsStyle?: string;
        bsSize?: string;
        navItem?: boolean;
        navDropdown?: boolean;
        componentClass?: string;
        href?: string;
        target?: string;
        type?: string;
    }
    interface Button extends  React.ReactElement<ButtonProps> { }
    interface ButtonClass extends  React.ComponentClass<ButtonProps> { }
    var Button: ButtonClass;


    // <ButtonToolbar />
    // ----------------------------------------
    interface ButtonToolbarProps extends React.HTMLProps<ButtonToolbarClass> {

        // Optional
        block?: boolean;
        bsSize?: string;
        bsStyle?: string;
        justified?: boolean;
        vertical?: boolean;
    }
    interface ButtonToolbar extends React.ReactElement<ButtonToolbarProps> { }
    interface ButtonToolbarClass extends  React.ComponentClass<ButtonToolbarProps> { }
    var ButtonToolbar: ButtonToolbarClass;

    // <ButtonGroup />
    // ----------------------------------------
    interface ButtonGroupProps extends React.HTMLProps<ButtonGroupClass> {
        // Optional
        block?: boolean;
        bsSize?: string;
        bsStyle?: string;
        justified?: boolean;
        vertical?: boolean;
    }
    interface ButtonGroup extends React.ReactElement<ButtonGroupProps> { }
    interface ButtonGroupClass extends  React.ComponentClass<ButtonGroupProps> { }
    var ButtonGroup: ButtonGroupClass;


    // <DropdownButton />
    // ----------------------------------------
    interface DropdownButtonProps extends React.HTMLProps<DropdownButtonClass> {
        bsStyle?: string;
        bsSize?: string;
        buttonClassName?: string;
        className?: string;
        dropup?: boolean;
        href?: string;
        navItem?: boolean;
        noCaret?: boolean;
        pullRight?: boolean;
        title?: any; // TODO: Add more specific type
    }
    interface DropdownButton extends React.ReactElement<DropdownButtonProps> { }
    interface DropdownButtonClass extends React.ComponentClass<DropdownButtonProps> { }
    var DropdownButton: DropdownButtonClass;


    // <SplitButton />
    // ----------------------------------------
    interface SplitButtonProps extends React.HTMLProps<SplitButtonClass>{
        bsStyle?: string;
        bsSize?: string;
        className?: string;
        disabled?: boolean;
        dropdownTitle?: any; // TODO: Add more specific type
        dropup?: boolean;
        href?: string;
        id?: string;
        pullRight?: boolean;
        target?: string;
        title?: any; // TODO: Add more specific type
    }
    interface SplitButton extends React.ReactElement<SplitButtonProps> { }
    interface SplitButtonClass extends React.ComponentClass<SplitButtonProps> { }
    var SplitButton: SplitButtonClass;


    // <MenuItem />
    // ----------------------------------------
    interface MenuItemProps extends React.HTMLProps<MenuItemClass> {
        active?: boolean;
        disabled?: boolean;
        divider?: boolean;
        eventKey?: any;
        header?: boolean;
        href?: string;
        target?: string;
        title?: string;
    }
    interface MenuItem extends React.ReactElement<MenuItemProps> { }
    interface MenuItemClass extends React.ComponentClass<MenuItemProps> { }
    var MenuItem: MenuItemClass;


    // <Panel />
    // ----------------------------------------
    interface PanelProps extends React.HTMLProps<PanelClass> {
        bsSize?: string;
        bsStyle?: string;
        collapsible?: boolean;
        defaultExpanded?: boolean;
        eventKey?: any;
        expanded?: boolean;
        footer?: any; // TODO: Add more specific type
        header?: any; // TODO: Add more specific type
        id?: string;
    }
    interface Panel extends React.ReactElement<PanelProps> { }
    interface PanelClass extends React.ComponentClass<PanelProps> { }
    var Panel: PanelClass;


    // <Accordion />
    // ----------------------------------------
    interface AccordionProps extends React.HTMLProps<AccordionClass> {
        bsSize?: string;
        bsStyle?: string;
        collapsible?: boolean;
        defaultExpanded?: boolean;
        eventKey?: any;
        expanded?: boolean;
        footer?: any; // TODO: Add more specific type
        header?: any; // TODO: Add more specific type
        id?: string;
    }
    interface Accordion extends React.ReactElement<AccordionProps> { }
    interface AccordionClass extends  React.ComponentClass<AccordionProps> { }
    var Accordion: AccordionClass;


    // <PanelGroup />
    // ----------------------------------------
    interface PanelGroupProps extends React.HTMLProps<PanelGroupClass> {
        accordion?: boolean;
        activeKey?: any;
        bsSize?: string;
        bsStyle?: string;
        className?: string;
        defaultActiveKey?: any;
    }
    interface PanelGroup extends React.ReactElement<PanelGroupProps> { }
    interface PanelGroupClass extends  React.ComponentClass<PanelGroupProps> { }
    var PanelGroup: PanelGroupClass;


    // <Modal.Dialog />
    // ----------------------------------------
    interface ModalDialogProps extends React.HTMLProps<ModalDialogClass> {
        // TODO: Add more specific type
    }
    interface ModalDialog extends React.ReactElement<ModalDialogProps> { }
    interface ModalDialogClass extends React.ComponentClass<ModalHeaderProps> { }


    // <Modal.Header />
    // ----------------------------------------
  interface ModalHeaderProps extends React.HTMLProps<ModalHeaderClass> {
        closeButton?: boolean;
        modalClassName?: string;
        onHide?: Function;
        // undefined?: string;
    }
    interface ModalHeader extends React.ReactElement<ModalHeaderProps> { }
    interface ModalHeaderClass extends React.ComponentClass<ModalHeaderProps> { }


    // <Modal.Title/>
    // ----------------------------------------
    interface ModalTitleProps extends React.HTMLProps<ModalTitleClass> {
        modalClassName?: string;
    }
    interface ModalTitle extends React.ReactElement<ModalTitleProps> { }
    interface ModalTitleClass extends React.ComponentClass<ModalTitleProps> { }


    // <Modal.Body />
    // ----------------------------------------
    interface ModalBodyProps extends React.HTMLProps<ModalBodyClass> {
        modalClassName?: string;
    }
    interface ModalBody extends React.ReactElement<ModalBodyProps> { }
    interface ModalBodyClass extends React.ComponentClass<ModalBodyProps> { }


    // <Modal.Footer />
    // ----------------------------------------
    interface ModalFooterProps extends React.HTMLProps<ModalFooterClass> {
        modalClassName?: string;
    }
    interface ModalFooter extends React.ReactElement<ModalFooterProps> { }
    interface ModalFooterClass extends React.ComponentClass<ModalFooterProps> { }


    // <Modal />
    // ----------------------------------------
    interface ModalProps extends React.HTMLProps<ModalClass> {
        // Required
        onHide: Function;

        // Optional
        animation?: boolean;
        autoFocus?: boolean;
        backdrop?: boolean|string;
        bsSize?: string;
        container?: any; // TODO: Add more specific type
        dialogClassName?: string;
        dialogComponent?: any; // TODO: Add more specific type
        enforceFocus?: boolean;
        keyboard?: boolean;
        show?: boolean;
    }
    interface Modal extends React.ReactElement<ModalProps> { }
    interface ModalClass extends React.ComponentClass<ModalProps> {
        Header: ModalHeaderClass;
        Title: ModalTitleClass;
        Body: ModalBodyClass;
        Footer: ModalFooterClass;
        Dialog: ModalDialogClass;
    }
    var Modal: ModalClass;


    // <OverlayTrigger />
    // ----------------------------------------
    interface OverlayTriggerProps extends React.HTMLProps<OverlayTriggerClass> {
        // Required
        overlay: any; // TODO: Add more specific type

        // Optional
        animation?: any; // TODO: Add more specific type
        container?: any; // TODO: Add more specific type
        containerPadding?: number;
        defaultOverlayShown?: boolean;
        delay?: number;
        delayHide?: number;
        delayShow?: number;
        onEnter?: Function;
        onEntered?: Function;
        onEntering?: Function;
        onExit?: Function;
        onExited?: Function;
        onExiting?: Function;
        placement?: string;
        rootClose?: boolean;
        trigger?: string;
    }
    interface OverlayTrigger extends React.ReactElement<OverlayTriggerProps> { }
    interface OverlayTriggerClass extends  React.ComponentClass<OverlayTriggerProps> { }
    var OverlayTrigger: OverlayTriggerClass;


    // <Tooltip />
    // ----------------------------------------
    interface TooltipProps extends React.HTMLProps<TooltipClass> {
        // Optional
        arrowOffsetLeft?: number | string;
        arrowOffsetTop?: number | string;
        bsSize?: string;
        bsStyle?: string;
        className?: string;
        id?: string;
        placement?: string;
        positionLeft?: number;
        positionTop?: number;
        title?: any; // TODO: Add more specific type
    }
    interface Tooltip extends React.ReactElement<TooltipProps> { }
    interface TooltipClass extends React.ComponentClass<TooltipProps> { }
    var Tooltip: TooltipClass;


    // <Popover/>
    // ----------------------------------------
    interface PopoverProps  extends React.HTMLProps<PopoverClass> {
        // Optional
        arrowOffsetLeft?: number | string;
        arrowOffsetTop?: number | string;
        bsSize?: string;
        bsStyle?: string;
        id?: string;
        placement?: string;
        positionLeft?: number;
        positionTop?: number;
        title: any; // TODO: Add more specific type
    }
    interface Popover extends React.ReactElement<PopoverProps> { }
    interface PopoverClass extends React.ComponentClass<PopoverProps> { }
    var Popover: PopoverClass;


    // <Overlay />
    // ----------------------------------------
    interface OverlayProps extends React.DOMProps<OverlayClass> {
        // Optional
        animation?: any; // TODO: Add more specific type
        container?: any; // TODO: Add more specific type
        containerPadding?: number; // TODO: Add more specific type
        onEnter?: Function;
        onEntered?: Function;
        onEntering?: Function;
        onExit?: Function;
        onExited?: Function;
        onExiting?: Function;
        onHide?: Function;
        placement?: string;
        rootClose?: boolean;
        show?: boolean;
        target?: Function;
    }
    interface Overlay extends React.ReactElement<OverlayProps> { }
    interface OverlayClass extends  React.ComponentClass<OverlayProps> { }
    var Overlay: OverlayClass;


    // <ProgressBar />
    // ----------------------------------------
    interface ProgressBarProps extends React.HTMLProps<ProgressBarClass> {
        // Optional
        active?: boolean;
        bsSize?: string;
        bsStyle?: string;
        className?: string;
        interpolatedClass?: any; // TODO: Add more specific type
        label?: any; // TODO: Add more specific type
        max?: number;
        min?: number;
        now?: number;
        srOnly?: boolean;
        striped?: boolean;
    }
    interface ProgressBar extends React.ReactElement<ProgressBarProps> { }
    interface ProgressBarClass extends  React.ComponentClass<ProgressBarProps> { }
    var ProgressBar: ProgressBarClass;


    // <Nav />
    // ----------------------------------------
    // TODO: This one turned into a union of two different types
    interface NavProps extends React.HTMLProps<NavClass> {
        // Optional
        activeHref?: string;
        activeKey?: any;
        bsSize?: string;
        bsStyle?: string;
        className?: string;
        collapsible?: boolean;
        eventKey?: any;
        expanded?: boolean;
        id?: string;
        justified?: boolean;
        navbar?: boolean;
        pullRight?: boolean;
        right?: boolean;
        stacked?: boolean;
        ulClassName?: string;
        ulId?: string;
    }
    interface Nav extends React.ReactElement<NavProps> { }
    interface NavClass extends  React.ComponentClass<NavProps> { }
    var Nav: NavClass;


    // <NavItem />
    // ----------------------------------------
    interface NavItemProps extends React.HTMLProps<NavItemClass> {
        active?: boolean;
        brand?: any; // TODO: Add more specific type
        bsSize?: string;
        bsStyle?: string;
        componentClass?: any; // TODO: Add more specific type
        defaultNavExpanded?: boolean;
        disabled?: boolean;
        eventKey?: any;
        fixedBottom?: boolean;
        fixedTop?: boolean;
        fluid?: boolean;
        href?: string;
        inverse?: boolean;
        linkId?: string;
        navExpanded?: boolean;
        onToggle?: Function;
        role?: string;
        staticTop?: boolean;
        target?: string;
        title?: string;
        toggleButton?: any; // TODO: Add more specific type
        toggleNavKey?: string | number;
    }
    interface NavItem extends React.ReactElement<NavItemProps> { }
    interface NavItemClass extends React.ComponentClass<NavItemProps> { }
    var NavItem: NavItemClass;


    // <Navbar />
    // ----------------------------------------
    interface NavbarProps extends React.HTMLProps<NavbarClass> {
        brand?: any; // TODO: Add more specific type
        bsSize?: string;
        bsStyle?: string;
        componentClass?: any; // TODO: Add more specific type
        defaultNavExpanded?: boolean;
        fixedBottom?: boolean;
        fixedTop?: boolean;
        fluid?: boolean;
        inverse?: boolean;
        navExpanded?: boolean;
        onToggle?: Function;
        role?: string;
        staticTop?: boolean;
        toggleButton?: any; // TODO: Add more specific type
        toggleNavKey?: string | number;
    }
    interface Navbar extends React.ReactElement<NavbarProps> { }
    interface NavbarClass extends  React.ComponentClass<NavbarProps> { }
    var Navbar: NavbarClass;

    // <NavBrand />
    // ----------------------------------------
    interface NavBrandProps {

    }
    interface NavBrand extends React.ReactElement<NavbarProps> { }
    interface NavBrandClass extends  React.ComponentClass<NavbarProps> { }
    var NavBrand: NavBrandClass;


    // <NavDropdown />
    // ----------------------------------------
    interface NavDropdownProps extends React.HTMLProps<NavDropdownClass> {
        eventKey?: any;
        title?: any;
        id?: string;
    }
    interface NavDropdown extends React.ReactElement<NavDropdownProps> { }
    interface NavDropdownClass extends  React.ComponentClass<NavDropdownProps> { }
    var NavDropdown: NavDropdownClass;


    // <Tabs />
    // ----------------------------------------
    interface TabsProps extends React.HTMLProps<TabsClass> {
        activeKey?: any;
        animation?: boolean;
        bsStyle?: string;
        defaultActiveKey?: any;
        paneWidth?: any; // TODO: Add more specific type
        position?: string;
        tabWidth?: any; // TODO: Add more specific type
    }
    interface Tabs extends React.ReactElement<TabsProps> { }
    interface TabsClass extends React.ComponentClass<TabsProps> { }
    var Tabs: TabsClass;


    // <Tab />
    // ----------------------------------------
    interface TabProps extends React.HTMLProps<TabClass> {
        animation?: boolean;
        disabled?: boolean;
        eventKey?: any; // TODO: Add more specific type
        title?: any; // TODO: Add more specific type
    }
    interface Tab extends React.ReactElement<TabProps> { }
    interface TabClass extends React.ComponentClass<TabProps> { }
    var Tab: TabClass;


    // <Pager />
    // ----------------------------------------
    interface PagerProps extends React.HTMLProps<PagerClass> {
    }
    interface Pager extends React.ReactElement<PagerProps> { }
    interface PagerClass extends  React.ComponentClass<PagerProps> { }
    var Pager: PagerClass;


    // <PageItem />
    // ----------------------------------------
    interface PageItemProps extends React.HTMLProps<PageItemClass> {
        disabled?: boolean;
        eventKey?: any;
        href?: string;
        next?: boolean;
        previous?: boolean;
        target?: string;
        title?: string;
    }
    interface PageItem extends React.ReactElement<PageItemProps> { }
    interface PageItemClass extends React.ComponentClass<PageItemProps> { }
    var PageItem: PageItemClass;


    // <Pagination />
    // ----------------------------------------
    interface PaginationProps extends React.HTMLProps<PaginationClass> {
        activePage?: number;
        bsSize?: string;
        bsStyle?: string;
        buttonComponentClass?: any; // TODO: Add more specific type
        ellipsis?: boolean;
        first?: boolean;
        items?: number;
        last?: boolean;
        maxButtons?: number;
        next?: boolean;
        prev?: boolean;
    }
    interface Pagination extends React.ReactElement<PaginationProps> { }
    interface PaginationClass extends React.ComponentClass<PaginationProps> { }
    var Pagination: PaginationClass;


    // <Alert />
    // ----------------------------------------
    interface AlertProps extends React.HTMLProps<AlertClass> {
        bsSize?: string;
        bsStyle?: string;
        closeLabel?: string;
        dismissAfter?: number;
        onDismiss?: Function;
    }
    interface Alert extends React.ReactElement<AlertProps> { }
    interface AlertClass extends React.ComponentClass<AlertProps> { }
    var Alert: AlertClass;


    // <Carousel />
    // ----------------------------------------
    interface CarouselProps extends React.HTMLProps<CarouselClass> {
        activeIndex?: number;
        bsSize?: string;
        bsStyle?: string;
        controls?: boolean;
        defaultActiveIndex?: number;
        direction?: string;
        indicators?: boolean;
        interval?: number;
        nextIcon?: any; // TODO: Add more specific type
        onSlideEnd?: Function;
        pauseOnHover?: boolean;
        prevIcon?: any; // TODO: Add more specific type
        slide?: boolean;
        wrap?: any | boolean;
    }
    interface Carousel extends React.ReactElement<CarouselProps> { }
    interface CarouselClass extends React.ComponentClass<CarouselProps> { }
    var Carousel: CarouselClass;


    // <CarouselItem />
    // ----------------------------------------
    interface CarouselItemProps extends React.HTMLProps<CarouselItemClass> {
        active?: boolean;
        animtateIn?: boolean;
        animateOut?: boolean;
        caption?: any; // TODO: Add more specific type
        direction?: string;
        index?: number;
        onAnimateOutEnd?: Function;
    }
    interface CarouselItem extends React.ReactElement<CarouselItemProps> { }
    interface CarouselItemClass extends React.ComponentClass<CarouselItemProps> { }
    var CarouselItem: CarouselItemClass;


    // <Grid />
    // ----------------------------------------
    interface GridProps extends React.HTMLProps<GridClass> {
        componentClass?: any; // TODO: Add more specific type
        fluid?: boolean;
    }
    interface Grid extends React.ReactElement<GridProps> { }
    interface GridClass extends React.ComponentClass<GridProps> { }
    var Grid: GridClass;


    // <Row />
    // ----------------------------------------
    interface RowProps extends React.HTMLProps<RowClass> {
        className?: string;
        componentClass?: any; // TODO: Add more specific type
    }
    interface Row extends React.ReactElement<RowProps> { }
    interface RowClass extends React.ComponentClass<RowProps> { }
    var Row: RowClass;


    // <Col />
    // ----------------------------------------
    interface ColProps extends React.HTMLProps<ColClass> {
        componentClass?: any; // TODO: Add more specific type
        lg?: number;
        lgOffset?: number;
        lgPull?: number;
        lgPush?: number;
        md?: number;
        mdOffset?: number;
        mdPull?: number;
        mdPush?: number;
        sm?: number;
        smOffset?: number;
        smPull?: number;
        smPush?: number;
        xs?: number;
        xsOffset?: number;
        xsPull?: number;
        xsPush?: number;
    }
    interface Col extends React.ReactElement<ColProps> { }
    interface ColClass extends React.ComponentClass<ColProps> { }
    var Col: ColClass;


    // <Image />
    // ----------------------------------------
    interface ImageProps extends React.HTMLProps<ImageClass> {
      src: string;
      responsive?: boolean;
      rounded?: boolean;
      circle?: boolean;
      thumbnail?: boolean;
    }
    interface Image extends React.ReactElement<ImageProps> { }
    interface ImageClass extends React.ComponentClass<ImageProps> { }
    var Image: ImageClass;


    // <Thumbnail />
    // ----------------------------------------
    interface ThumbnailProps extends React.HTMLProps<ThumbnailClass> {
        alt?: string;
        bsSize?: string;
        bsStyle?: string;
        href?: string;
        src?: string;
    }
    interface Thumbnail extends React.ReactElement<ThumbnailProps> { }
    interface ThumbnailClass extends React.ComponentClass<ThumbnailProps> { }
    var Thumbnail: ThumbnailClass;


    // <ListGroup />
    // ----------------------------------------
    interface ListGroupProps extends React.HTMLProps<ListGroupClass> {
        className?: string;
        fill?: boolean; // TODO: Add more specific type
    }
    interface ListGroup extends React.ReactElement<ListGroupProps> { }
    interface ListGroupClass extends React.ComponentClass<ListGroupProps> { }
    var ListGroup: ListGroupClass;


    // <ListGroupItem />
    // ----------------------------------------
    interface ListGroupItemProps extends React.HTMLProps<ListGroupItemClass> {
        active?: any;
        bsSize?: string;
        bsStyle?: string;
        className?: string;
        disabled?: any;
        eventKey?: any;
        header?: any; // TODO: Add more specific type
        href?: string;
        listItem?: boolean;
        target?: string;
    }
    interface ListGroupItem extends React.ReactElement<ListGroupItemProps> { }
    interface ListGroupItemClass extends React.ComponentClass<ListGroupItemProps> { }
    var ListGroupItem: ListGroupItemClass;


    // <Label />
    // ----------------------------------------
    interface LabelProps extends React.HTMLProps<LabelClass> {
        bsSize?: string;
        bsStyle?: string;
    }
    interface Label extends React.ReactElement<LabelProps> { }
    interface LabelClass extends React.ComponentClass<LabelProps> { }
    var Label: LabelClass;


    // <Badge />
    // ----------------------------------------
    interface BadgeProps extends React.HTMLProps<BadgeClass> {
        pullRight?: boolean;
    }
    interface Badge extends React.ReactElement<BadgeProps> { }
    interface BadgeClass extends React.ComponentClass<BadgeProps> { }
    var Badge: BadgeClass;


    // <Jumbotron />
    // ----------------------------------------
    interface JumbotronProps extends React.HTMLProps<JumbotronClass> {
        componentClass?: any; // TODO: Add more specific type
    }
    interface Jumbotron extends React.ReactElement<JumbotronProps> { }
    interface JumbotronClass extends React.ComponentClass<JumbotronProps> { }
    var Jumbotron: JumbotronClass;


    // <PageHeader />
    // ----------------------------------------
    interface PageHeaderProps extends React.HTMLProps<PageHeaderClass> {
    }
    interface PageHeader extends React.ReactElement<PageHeaderProps> { }
    interface PageHeaderClass extends React.ComponentClass<PageHeaderProps> { }
    var PageHeader: PageHeaderClass;


    // <Well />
    // ----------------------------------------
    interface WellProps extends React.HTMLProps<WellClass> {
        bsSize?: string;
        bsStyle?: string;
    }
    interface Well extends React.ReactElement<WellProps> { }
    interface WellClass extends React.ComponentClass<WellProps> { }
    var Well: WellClass;


    // <Glyphicon />
    // ----------------------------------------
    interface GlyphiconProps extends React.HTMLProps<GlyphiconClass> {
        // Required
        glyph: string;
    }
    interface Glyphicon extends React.ReactElement<GlyphiconProps> { }
    interface GlyphiconClass extends React.ComponentClass<GlyphiconProps> { }
    var Glyphicon: GlyphiconClass;


    // <Table />
    // ----------------------------------------
    interface TableProps extends React.HTMLProps<TableClass> {
        bordered?: boolean;
        condensed?: boolean;
        hover?: boolean;
        responsive?: boolean;
        striped?: boolean;
    }
    interface Table extends React.ReactElement<TableProps> { }
    interface TableClass extends React.ComponentClass<TableProps> { }
    var Table: TableClass;


    // <Input />
    // ----------------------------------------
    interface InputProps extends React.HTMLProps<InputClass> {
        addonAfter?: any; // TODO: Add more specific type
        addonBefore?: any; // TODO: Add more specific type
        bsSize?: string;
        bsStyle?: string;
        buttonAfter?: any; // TODO: Add more specific type
        buttonBefore?: any; // TODO: Add more specific type
        checked?: boolean;
        disabled?: boolean;
        feedbackIcon?: any; // TODO: Add more specific type
        groupClassName?: string;
        hasFeedback?: boolean;
        help?: any; // TODO: Add more specific type
        label?: any; // TODO: Add more specific type
        labelClassName?: string;
        multiple?: boolean;
        placeholder?: string;
        ref?: string;
        readOnly?: boolean;
        type?: string;
        defaultValue?: any;
        value?: any; // TODO: Add more specific type
        wrapperClassName?: string;
        standalone?: boolean;
    }
    interface Input extends React.ReactElement<InputProps> { }
    interface InputClass extends React.ComponentClass<InputProps> { }
    var Input: InputClass;


    // <ButtonInput />
    // ----------------------------------------
    interface ButtonInputProps extends React.HTMLProps<ButtonInputClass> {
        addonAfter?: any; // TODO: Add more specific type
        addonBefore?: any; // TODO: Add more specific type
        bsSize?: string;
        bsStyle?: string;
        buttonAfter?: any; // TODO: Add more specific type
        buttonBefore?: any; // TODO: Add more specific type
        disabled?: boolean;
        feedbackIcon?: any; // TODO: Add more specific type
        groupClassName?: string;
        hasFeedback?: boolean;
        help?: any; // TODO: Add more specific type
        label?: any; // TODO: Add more specific type
        labelClassName?: string;
        multiple?: boolean;
        type?: string;
        value?: any; // TODO: Add more specific type
        wrapperClassName?: string;
    }
    interface ButtonInput extends React.ReactElement<ButtonInputProps> { }
    interface ButtonInputClass extends React.ComponentClass<ButtonInputProps> { }
    var ButtonInput: ButtonInputClass;


    // TODO: FormControls.Static


    // <Portal />
    // ----------------------------------------
    interface PortalProps extends React.HTMLProps<PortalClass> {
        dimension?: string | Function;
        getDimensionValue?: Function;
        in?: boolean;
        onEnter?: Function;
        onEntered?: Function;
        onEntering?: Function;
        onExit?: Function;
        onExited?: Function;
        onExiting?: Function;
        role?: string;
        timeout?: number;
        transitionAppear?: boolean;
        unmountOnExit?: boolean;
    }
    interface Portal extends React.ReactElement<PortalProps> { }
    interface PortalClass extends React.ComponentClass<PortalProps> { }
    var Portal: PortalClass;


    // <Position />
    // ----------------------------------------
    interface PositionProps extends React.HTMLProps<PositionClass> {
        dimension?: string | Function;
        getDimensionValue?: Function;
        in?: boolean;
        onEnter?: Function;
        onEntered?: Function;
        onEntering?: Function;
        onExit?: Function;
        onExited?: Function;
        onExiting?: Function;
        role?: string;
        timeout?: number;
        transitionAppear?: boolean;
        unmountOnExit?: boolean;
    }
    interface Position extends React.ReactElement<PositionProps> { }
    interface PositionClass extends  React.ComponentClass<PositionProps> { }
    var Position: PositionClass;


    // <Fade />
    // ----------------------------------------
    interface FadeProps extends React.HTMLProps<FadeClass> {
        in?: boolean;
        onEnter?: Function;
        onEntered?: Function;
        onEntering?: Function;
        onExit?: Function;
        onExited?: Function;
        onExiting?: Function;
        timeout?: number;
        transitionAppear?: boolean;
        unmountOnExit?: boolean;
    }
    interface Fade extends React.ReactElement<FadeProps> { }
    interface FadeClass extends React.ComponentClass<FadeProps> { }
    var Fade: FadeClass;
}
