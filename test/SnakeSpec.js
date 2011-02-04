describe("Snake", function () {

  // set Snake to debug, don't run the queries just output them to the console
  Snake.debug = true;

  it("Snake is version 0.0.27", function () {
    expect(Snake.version).toEqual("0.0.27");
  });

  it("Criteria should be defined", function () {
    expect(Criteria).toBeDefined();
  });

  describe("Criteria", function () {
    it("Custom Query should build through Criteria properly", function () {
      var c = new Criteria();
      expect(c.buildQuery({
        select: "*",
        from: "snake",
        where: "version = ?",
        orderBy: "id desc"
      })).toEqual("SELECT * FROM snake WHERE version = ? ORDER BY id desc");
    });
  });

  describe("Cards", function () {
    it("testing the doSelect", function () {
      CardPeer.doSelect(new Criteria(), function (results) {
        console.log('im here');
        console.log(results);
        //expect(results).toEqual("SELECT * FROM query");;
      });
    });
  });

});
