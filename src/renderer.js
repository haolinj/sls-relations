import fp from 'lodash/fp';
import flatten from 'flat';
import { DataSet, Network } from 'vis/index-network';

export const renderGraph = (services, enablePhysics, showLabel, enableComplication) => {
  const relationShips =
    fp.flow(
      fp.uniqBy(service => service.serviceName),
      fp.map(service => {
        const serviceProps = flatten(service);
        const imports = fp.flow(
          fp.filter(k => fp.includes('Fn::ImportValue')(k)),
          fp.map(k => serviceProps[k])
        )(fp.keys(serviceProps));
        return {
          exports: service.resources ? fp.map(o => o.Export.Name)(service.resources.Outputs) : undefined,
          imports,
          serviceName: service.serviceName
        };
      })
    )(services);

  const serviceDependencies = fp.map(relationShip => {
    const dependOn =
      fp.flow(
        fp.map(impt => {
          const parent = fp.find(rl => fp.includes(impt)(rl.exports))(relationShips);
          return {
            service: parent ? parent.serviceName : 'N/A',
            by: impt.split('-')[0]
          };
        }),
        fp.uniqBy(dep => dep.by)
      )(relationShip.imports);

    return {
      name: relationShip.serviceName,
      dependOn
    };
  })(relationShips);

  const simpleDependencies = fp.map(sd => {
    const dependencies = sd.dependOn;
    const simplifiedDependOn = fp.reduce((rs, dep) => {
      const addedService = fp.find(s => dep.service === s.service)(rs);
      if (addedService) {
        return fp.map(r => {
          if (r.service === dep.service) {
            return { ...r, by: r.by + '\n' + dep.by };
          }
          else {
            return r;
          }
        })(rs);
      }
      else {
        return [...rs, dep];
      }
    })([])(dependencies);
    return {
      name: sd.name,
      dependOn: simplifiedDependOn
    };
  })(serviceDependencies);


  console.log('Complicated Version', serviceDependencies);
  console.log('Simple Version', simpleDependencies);

  const dependencies = enableComplication ? serviceDependencies : simpleDependencies;

  const dataSet = fp.map(sd => ({
    id: sd.name,
    label: sd.name,
    color: '#ff8d02',
    font: {
      color: '#000000'
    },
    shape: 'box'
  }))(dependencies);

  const edgesData =
    fp.flow(
      fp.map(sd => {
        return fp.map(depend => ({
          from: sd.name,
          to: depend.service,
          arrows: 'to',
          label: showLabel ? depend.by : undefined
        }))(sd.dependOn);
      }),
      fp.flatten
    )(dependencies);

  const nodes = new DataSet(dataSet);
  const edges = new DataSet(edgesData);

  const container = document.getElementById('output');
  const data = {
    nodes,
    edges
  };

  console.log('Edges', edgesData);

  new Network(container, data, {
    physics: {
      enabled: enablePhysics
    }
  });
};
