import React from 'react';
import fp from 'lodash/fp';
import flatten from 'flat';
import { DataSet, Network } from 'vis/index-network';

export const renderGraph =
  (services, enablePhysics, showLabel, enableComplication, onNodeSelected) => {
    const relationShips = serviceRelationships(services);
    const serviceDependencies = renderAllDeps(relationShips);
    const simpleDependencies = renderSimpleDeps(serviceDependencies);

    console.log('Complicated Version', serviceDependencies);
    console.log('Simple Version', simpleDependencies);

    const dependencies = enableComplication ? serviceDependencies : simpleDependencies;
    const dataSet = fp.map(nodeProps)(dependencies);
    const edgesData =
      fp.flow(
        fp.map(sd => fp.map(edgeProps(sd, showLabel))(sd.dependOn)),
        fp.flatten
      )(dependencies);

    const nodes = new DataSet(dataSet);
    const edges = new DataSet(edgesData);
    const container = document.getElementById('output');
    const data = { nodes, edges };

    console.log('Edges', edgesData);

    const network = new Network(container, data, {
      physics: {
        enabled: enablePhysics
      }
    });

    network.on('selectNode', onNodeSelected(dependencies));
  };

export const renderSelectedNode = (selectedNode) => {
  const functions = combineNames(selectedNode.functions);
  const resources = combineNames(selectedNode.resources);
  return (
    <div className='alert alert-info text-left' style={{ overflowX: 'scroll' }}>
      <h5>{selectedNode.name}</h5>
      <div style={{ marginBottom: '15px' }}>
        {functions === '' ? null : <span><b>Functions</b> {functions}</span>}
      </div>
      <div>
        {resources === '' ? null : <span><b>Resources</b> {resources}</span>}
      </div>
    </div>);
};


const combineNames = (names) =>
  fp.flow(
    fp.keys,
    fp.reduce((res, name) => <span>{res}<br />{name}</span>)('')
  )(names);

const nodeProps = (sd) => ({
  id: sd.name,
  label: sd.name,
  color: '#ff8d02',
  font: {
    color: '#000000'
  },
  shape: 'box'
});

const edgeProps = (sd, showLabel) => (depend) => ({
  from: sd.name,
  to: depend.service,
  arrows: 'to',
  label: showLabel ? depend.by : undefined
});

const serviceRelationships = (services) =>
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
        serviceName: service.serviceName,
        resources: service.resources ? service.resources.Resources : undefined,
        functions: service.functions
      };
    })
  )(services);

const renderAllDeps = (relationShips) =>
  fp.map(relationShip => {
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
      dependOn,
      resources: relationShip.resources,
      functions: relationShip.functions
    };
  })(relationShips);

const renderSimpleDeps = (serviceDependencies) =>
  fp.map(sd => {
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
      dependOn: simplifiedDependOn,
      resources: sd.resources,
      functions: sd.functions
    };
  })(serviceDependencies);
