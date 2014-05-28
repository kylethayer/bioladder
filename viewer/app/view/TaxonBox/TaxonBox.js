/**
 *  Copyright (C) 2013 BioLadder.Org
 *
 *  This file is part of the BioLadder.Org project (http://bioladder.org/)
 *
 *  BioLadder.Org is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

Ext.define('BioLadderOrg.view.TaxonBox.TaxonBox', {
    xtype: 'taxonbox',
    extend: 'Ext.Panel',

    requires: [
        'Ext.Label',
        'Ext.String',
        'BioLadderOrg.view.TaxonBox.TaxonBoxContents'
    ],
    
    statics:{
        getHeight: function(isOpen){
            if(isOpen){
                return 293;
            }else{
                return 21;
            }
        },
        getWidth: function(isOpen){
            if(isOpen){
                return 500;
            }else{
                return 200;
            }
        }
    },

    config: {
        control: {
            '#taxonLabel': {
                tap: 'onLabelTap'
            },
            '#wikiEditBtn': {
                tap: 'onWikiEditBtnTap'
            },
            '#wikipediaBtn': {
                tap: 'onWikipediaBtnTap'
            }
        },
        border: 1,
        cls: 'taxon-panel',
        collapsed: false,
        taxon: null,
        items: [{
            xtype: 'button',
            baseCls: 'taxon-panel-label',
            html: '',
            itemId: 'taxonLabel'
        }, {
            xtype: 'container',
            itemId: 'contentMask',
            height: '270px',
            style: 'overflow: hidden;',
            hidden: true,
            items: {
                xtype: 'container',
                itemId: 'collapsibleContent',
                style: 'overflow: hidden;',
                width: '498px',
                height: '270px',
                items: [{
                    xtype: 'taxonboxcontents',
                    width: '498px',
                    height: '255px',
                    scrollable: 'vertical'
                }, {
                    xtype: 'container',
                    items: [{
                        xtype: 'button',
                        baseCls: 'link-btn',
                        html: 'edit',
                        itemId: 'wikiEditBtn',
                        width: '3em'
                    }, {
                        xtype: 'button',
                        baseCls: 'link-btn',
                        docked: 'right',
                        hidden: true,
                        html: 'wikipedia page',
                        itemId: 'wikipediaBtn',
                        width: '9em'
                    }]
                }]
            }
        }],
        width: 500
    },

    updateTaxon: function (newTaxon, oldTaxon) {
        var me = this;
        //reset view elements
        me.down('#wikipediaBtn').setHidden(true);

        //set name and rest of fields when loaded
        me.updateTitle();
        me.down('taxonboxcontents').setMasked({
            xtype: 'loadmask'
        });
        newTaxon.whenLoaded(function (newTaxon) {
            if (!me.__isDestroyed) {
                me.onTaxonLoaded(newTaxon);
                me.down('taxonboxcontents').setMasked(false);
            }
        });
    },

    updateCollapsed: function (newCollapsed) {
        var me = this;
        if (newCollapsed) {
            me.setWidth(200);
            me.down('#contentMask').setHidden(true);
        } else {
            me.setWidth(500);
            me.down('#contentMask').setHidden(false);
        }
        me.updateTitle();
    },

    onTaxonLoaded: function (newTaxon) {
        if (!this.__isDestroyed) {
            var me = this;
            me.down('taxonboxcontents').setData(newTaxon.data);
            me.updateTitle();
        
            if (newTaxon.get('wikipediaPage')) {
                this.down('#wikipediaBtn').setHidden(false);
            }
            if(newTaxon.get('exampleMember')) {
                var exampleMember = newTaxon.get('exampleMember');
                exampleMember.whenLoaded(function (exampleMember) {
                    me.onExampleMemberLoaded(exampleMember);
                });
            }
            
        }
    },
    
    onExampleMemberLoaded: function (exampleMember) {
        if (!this.__isDestroyed) {
            this.down('taxonboxcontents').setData(this.getTaxon().data);
        }
    },

    onWikiEditBtnTap: function () {
        var taxon = this.getTaxon();
        if (taxon) {
            window.open(
                window.location.pathname.slice(0, window.location.pathname.search('/\/viewer/') - 7) +
                    '/wiki/index.php?title=' + taxon.get('name') + '&action=formedit',
                '_blank'
            );
        }
    },

    onWikipediaBtnTap: function () {
        var taxon = this.getTaxon();
        if (taxon) {
            window.open(taxon.get('wikipediaPage'), '_blank');
        }
    },

    onLabelTap: function () {
        var taxon = this.getTaxon();
        if (taxon) {
            this.fireEvent('navigatetotaxon', taxon);
        }
    },
    
    updateTitle: function() {
        var me = this;
        if(me.getCollapsed() || !me.getTaxon().get('taxonomicRank')){
            me.down('#taxonLabel').setHtml(me.getTaxon().get('name'));
        } else {
            me.down('#taxonLabel').setHtml(me.getTaxon().get('name') + ' (' + Ext.String.htmlEncode(me.getTaxon().get('taxonomicRank')) + ')');
        }
    },
    
    destroy: function(){
        this.__isDestroyed = true;       
        this.callSuper();
    },
    
    animateTo: function(pos, collapse, taxonRotation, callback){
        var me = this;
        
        var currentLeft = me.getLeft();
        var currentTop = me.getTop();
        
        var beforeIsCollapsed = me.getCollapsed();
        
        var currentTransform = me.element.dom.style.webkitTransform;
        var rotateMatch = /rotate\(([-\d]*)deg\)/.exec(currentTransform);
        if(!rotateMatch){
            currentTransform += ' rotate(0deg) '
        }
        var translateMatch = /translate3d\(([\d px]*)\)/.exec(currentTransform);
        if(!translateMatch){
            currentTransform += ' translate3d(0 px, 0 px, 0) '
        }
        
        if(collapse && !beforeIsCollapsed){
            Ext.Animator.run({
                element: me.down('#contentMask').element,
                duration: 500,
                easing: 'ease-in-out',
                from: {
                    'height': '270px'
                },
                to: {
                    'height': '0px'
                },
                onEnd: function(arguments){
                    me.setCollapsed(true);
                }
            });
            Ext.Animator.run({
                element: me.down('#collapsibleContent').element,
                duration: 500,
                easing: 'ease-in-out',
                from: {
                    'width': '498px'
                },
                to: {
                    'width': '198px'
                },
                onEnd: function(arguments){
                    me.setCollapsed(true);
                }
            });
        }else if(!collapse && beforeIsCollapsed){
            me.setCollapsed(false);
            Ext.Animator.run({
                element: me.down('#contentMask').element,
                duration: 500,
                easing: 'ease-in-out',
                from: {
                    'height': '0px'
                },
                to: {
                    'height': '270px'
                },
                onEnd: function(arguments){
                    me.down('#contentMask').setStyle({
                        'height': '270px'
                    });
                    return true;
                }
            });
            Ext.Animator.run({
                element: me.down('#collapsibleContent').element,
                duration: 500,
                easing: 'ease-in-out',
                from: {
                    'width': '198px'
                },
                to: {
                    'width': '498px'
                },
                onEnd: function(arguments){
                    me.down('#contentMask').setStyle({
                        'width': '498px'
                    });
                    return true;
                }
            });
        }
        
        Ext.Animator.run({
            element: me.element,
            duration: BioLadderOrg.view.TaxaContainerPositionCalculator.getAnimationDuration(),
            easing: 'ease-in-out',
            from: {
                '-webkit-transform': currentTransform,
                'width': BioLadderOrg.view.TaxonBox.TaxonBox.getWidth(!beforeIsCollapsed) + 'px'               
            },
            to: {
                '-webkit-transform': 'translate3d(' + (pos[0] - currentLeft) + 'px, ' + (pos[1] - currentTop) + 'px, 0) ' +
                                     ' rotate('+taxonRotation+'deg) ',
                'width': BioLadderOrg.view.TaxonBox.TaxonBox.getWidth(!collapse) + 'px'
            },
            onEnd: function(arguments){
                me.setLeft(pos[0]);
                me.setTop(pos[1]);
                me.setStyle({
                    '-webkit-transform': 'rotate('+taxonRotation+'deg)',
                    'width': BioLadderOrg.view.TaxonBox.TaxonBox.getWidth(!collapse) + 'px'
                });
                if(callback){
                    callback(me);
                }
                return true;
            }
        });
    },
    
    fadeIn: function(){
        var me = this;
        Ext.Animator.run({
            element: me.element,
            autoClear: false,
            duration: BioLadderOrg.view.TaxaContainerPositionCalculator.getAnimationDuration(),
            easing: 'ease-in-out',
            from: {
                'opacity': 0
            },
            to: {
                'opacity': 1,
            }
        });
    },
    
    fadeOut: function(callBack){
        var me = this;
        
        if(me.element == null){
            console.log("cannot fade out taxon box: " + me.getTaxon().get('name') + ' since it has already been deleted');
            return;
        }
        Ext.Animator.run({
            element: me.element,
            autoClear: false,
            duration: BioLadderOrg.view.TaxaContainerPositionCalculator.getAnimationDuration() / 2,
            easing: 'linear',
            from: {
                'opacity': 1
            },
            to: {
                'opacity': 0,
            },
            onEnd: function(){
                callBack(me);
            }
        });
    },
});
