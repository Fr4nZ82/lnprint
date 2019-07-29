LnPrint.dashboard = {
  draw:{
    overview: (userData)=>{                                                     //DRAW OVERVIEW
      summary = userData.summary
      LnPrint.clear.contentWrapper()
      LnPrint.draw.drawingspace()
      LnPrint.draw.row(0)
      LnPrint.draw.column(0,'mescolumn',6)
      LnPrint.draw.column(0,'foucolumn',6)
      LnPrint.draw.column(0,'worcolumn',6)
      LnPrint.draw.column(0,'shicolumn',6)

      $('#mescolumn').append(LnPrint.dashboard.print.overviewCard('mes',summary.mes()+' new messages'))
      $('#foucolumn').append(LnPrint.dashboard.print.overviewCard('fou',summary.fou()+' satoshis'))
      $('#worcolumn').append(LnPrint.dashboard.print.overviewCard('wor',summary.wor()+' active works'))
      $('#shicolumn').append(LnPrint.dashboard.print.overviewCard('shi',summary.shi()+' shipments'))
    },
    messages: (userData)=>{                                                     //DRAW MESSAGES
      messages = userData.messages
      LnPrint.clear.contentWrapper()
      LnPrint.draw.drawingspace(true)
      LnPrint.saveHistory({
        funcs: [
          ['req','changepage'],
          ['dashboard','draw','messages']
        ],
        args: [
          ['dashboard'],
          [userData]
        ]
      })
    },
    founds: (userData)=>{                                                       //DRAW FOUNDS
      let _founds=userData.account
      LnPrint.clear.contentWrapper()
      LnPrint.draw.drawingspace()
      LnPrint.draw.row(0)
      LnPrint.draw.row(1)
      LnPrint.draw.column(0,'balancecolumn',3)
      LnPrint.draw.column(0,'channelscolumn',9)
      LnPrint.draw.column(1,'transactionscolumn',12)
      $('#balancecolumn').append(LnPrint.dashboard.print.balanceCard(_founds))
      $('#channelscolumn').append(LnPrint.dashboard.print.channelsTable(_founds))
      $('#transactionscolumn').append(LnPrint.dashboard.print.transTable(_founds))
      $('#transtable').DataTable({
        "dom":'tlfrip',
        "info": false,
        paging:false,
        renderer: "bootstrap",
        searching: false,
        scrollCollapse: true,
        "autoWidth": false,
        scrollY:350
      }).column( '0:visible' ).order( 'desc' ).draw()

      $('#channelstable').DataTable({
        "dom":'tlfrip',
        "info": false,
        paging: false,
        renderer: "bootstrap",
        searching: false,
        scrollCollapse: true,
        "autoWidth": false,
        scrollY:150
      })
      LnPrint.saveHistory({
        funcs: [
          ['req','changepage'],
          ['dashboard','draw','founds']
        ],
        args: [
          ['dashboard'],
          [userData]
        ]
      })
    },
    works: (userData)=>{                                                        //DRAW WORKS
      works = userData.works
      LnPrint.clear.contentWrapper()
      LnPrint.draw.drawingspace(true)
      LnPrint.saveHistory({
        funcs: [
          ['req','changepage'],
          ['dashboard','draw','works']
        ],
        args: [
          ['dashboard'],
          [userData]
        ]
      })
    },
    shipments: (userData)=>{                                                    //DRAW SHIPMENTS
      var shipments = userData.shipments,
          works = userData.works,
          cart = userData.cart
      LnPrint.clear.contentWrapper()
      LnPrint.draw.drawingspace()
      LnPrint.draw.row(0)
      LnPrint.draw.column(0,'cartcolumn',12)
      LnPrint.draw.column(0,'shipmentscolumn',12)
      $('#cartcolumn').append(LnPrint.dashboard.print.cartTable(cart,works))
      $('#shipmentscolumn').append(LnPrint.dashboard.print.shipmentsTable(shipments,works))
      LnPrint.saveHistory({
        funcs: [
          ['req','changepage'],
          ['dashboard','draw','shipments']
        ],
        args: [
          ['dashboard'],
          [userData]
        ]
      })
    }
  }
}
