import {expect} from 'chai';

/**
 * In this test suite we will explore the Proxy object.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
 */

describe('Proxy', function() {

  it('intercepts all access', function() {
    class AdminActions {
      openLock() {
        return 'Lock opened';
      }
      deleteDatabase() {
        return 'Database deleted';
      }
    }

    const adminActions = new AdminActions;

    // TODO Complete the handler of the Proxy below to prevent
    // any function execution (i.e. satisfy all the assertions below)
    const proxiedAdminActions = new Proxy(adminActions, {
      get() {
        return function() {
          return 'Access forbidden';
        };
      }
    });

    expect(proxiedAdminActions.openLock()).to.equal('Access forbidden');
    expect(proxiedAdminActions.deleteDatabase()).to.equal('Access forbidden');
  });

  it('intercepts unknown attributes', function() {
    // Here is a dog object.
    // It is named Hector and the only thing he can do is walk
    const dog = {
      name: 'Hector',

      walk: function() {
        return 'Walking...';
      }
    };

    // Without touching the dog object, implement the handler
    // of the following Proxy to make our dog more talkative
    // (i.e. satisfy all the assertions below)
    const talkativeDog = new Proxy(dog, {
      get(t, p) {
        if (Reflect.get(t, p)) {
          return Reflect.get(t, p);
        } else {
          return function() {
            return 'Woof-woof';
          }
        }
      }
    });

    expect(talkativeDog.walk()).to.equal('Walking...');
    expect(talkativeDog.jump()).to.equal('Woof-woof');
    expect(talkativeDog.dance()).to.equal('Woof-woof');
    expect(talkativeDog.sit()).to.equal('Woof-woof');
    expect(talkativeDog.sleep()).to.equal('Woof-woof');
    expect(talkativeDog.goAroundTheHouseAndThenComeBack()).to.equal('Woof-woof');
  });

  it('count function calls', function() {
    const accessDatabase = function() {
      return 'Accessing the database';
    };

    let numberOfAccess = 0;
    const loggedDatabaseAccess = new Proxy(accessDatabase, {
      // TODO Implement the handler of this proxy to satisfy the assertions.
      apply() {
        numberOfAccess++;
        Reflect.apply(...arguments);
      }
    });

    loggedDatabaseAccess();
    loggedDatabaseAccess();
    loggedDatabaseAccess();
    loggedDatabaseAccess();
    expect(numberOfAccess).to.equal(4);
  });

  /**
   * This test is quite advanced and requires a good understanding of the Proxy object.
   */
  it('my own test framework', function() {
    // Implement the spy function below to satisfy all the assertions.
    const spy = (someObject) => {
      let count = {};
      return new Proxy(someObject, {
        get(t, p) {
          if(p === 'totalCalls'){
            return count;
          }
          if (typeof t[p] === 'function'){
            return new Proxy(t[p], {
              apply(){
                let number = count[p] ? count[p] + 1 : 1;
                count[p] = number;
                return Reflect.apply(...arguments);
              }
            });
          } else {
            return t[p];
          }
        }
      });
    };

    class Snake {
      bite() {
        return 'Bites...';
      }

      hiss() {
        return 'Ssshhhhh...';
      }

      fastAttack() {
        this.bite();
        this.bite();
      }
    }

    const snake = spy(new Snake());
    snake.hiss();
    snake.bite();
    snake.bite; // Accessing the bite function but not calling it.
    snake.hiss();
    snake.fastAttack();

    expect(snake.totalCalls.hiss).to.equal(2);
    expect(snake.totalCalls.bite).to.equal(3);
    expect(snake.totalCalls.fastAttack).to.equal(1);
  });
});
